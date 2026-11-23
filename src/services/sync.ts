import mqtt, { type MqttClient } from 'mqtt';
import type { OnlinePeer, SpottedRecord, SyncStatus } from '../types';

export interface SyncPayload {
  type: 'state';
  tripName: string;
  states: Record<string, SpottedRecord>;
  senderId: string;
  senderName: string;
  sentAt: number;
}

interface PresencePayload {
  type: 'presence';
  senderId: string;
  senderName: string;
  online: boolean;
  sentAt: number;
}

interface SyncRequestPayload {
  type: 'sync-req';
  senderId: string;
  sentAt: number;
}

const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

const TOPIC_PREFIX = 'plate-mate/v1/rooms';

export interface TripSyncCallbacks {
  onStatusChange: (status: SyncStatus) => void;
  onRemoteState: (payload: SyncPayload) => void;
  onPeersChange: (peers: OnlinePeer[]) => void;
}

/**
 * Serverless real-time multiplayer trip synchronization using MQTT over WSS.
 * Works across cellular NATs on mobile phones and uses retained messages plus
 * explicit sync requests so new joiners and phones emerging from dead zones
 * receive the full trip state immediately.
 */
export class TripSyncClient {
  private client: MqttClient | null = null;
  private roomCode: string;
  private clientId: string;
  private playerName: string;
  private callbacks: TripSyncCallbacks;
  private peers: Map<string, OnlinePeer> = new Map();
  private heartbeatTimer: number | null = null;
  private pruneTimer: number | null = null;
  private initialRetainTimer: number | null = null;
  private brokerIndex = 0;
  private destroyed = false;
  private latestSnapshot: { tripName: string; states: Record<string, SpottedRecord> } | null = null;

  constructor(roomCode: string, playerName: string, callbacks: TripSyncCallbacks) {
    this.roomCode = roomCode.toUpperCase();
    this.playerName = playerName.trim() || 'Road Tripper';
    this.clientId = `pm_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    this.callbacks = callbacks;
  }

  private get stateTopic(): string {
    return `${TOPIC_PREFIX}/${this.roomCode}/state`;
  }

  private get deltaTopic(): string {
    return `${TOPIC_PREFIX}/${this.roomCode}/delta`;
  }

  private get syncReqTopic(): string {
    return `${TOPIC_PREFIX}/${this.roomCode}/sync-req`;
  }

  private get presenceTopic(): string {
    return `${TOPIC_PREFIX}/${this.roomCode}/presence/${this.clientId}`;
  }

  private get presenceWildcard(): string {
    return `${TOPIC_PREFIX}/${this.roomCode}/presence/+`;
  }

  public connect(initialSnapshot?: { tripName: string; states: Record<string, SpottedRecord> }): void {
    if (this.destroyed) return;
    if (initialSnapshot) {
      this.latestSnapshot = initialSnapshot;
    }

    this.callbacks.onStatusChange('connecting');
    const url = BROKERS[this.brokerIndex % BROKERS.length];

    const willPayload: PresencePayload = {
      type: 'presence',
      senderId: this.clientId,
      senderName: this.playerName,
      online: false,
      sentAt: Date.now(),
    };

    const client = mqtt.connect(url, {
      clientId: this.clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 4000,
      keepalive: 30,
      will: {
        topic: this.presenceTopic,
        payload: JSON.stringify(willPayload),
        qos: 0,
        retain: false,
      },
    });

    this.client = client;

    client.on('connect', () => {
      if (this.destroyed) return;
      this.callbacks.onStatusChange('connected');
      client.subscribe(
        [this.stateTopic, this.deltaTopic, this.syncReqTopic, this.presenceWildcard],
        { qos: 0 },
        () => {
          if (this.destroyed || !client.connected) return;
          this.publishPresence(true);
          this.publishSyncRequest();

          // If we already have local states (e.g. host turning on multiplayer or offline edits),
          // broadcast a live delta immediately and persist retained state shortly after any
          // broker-retained state has had a chance to merge.
          if (this.latestSnapshot && Object.keys(this.latestSnapshot.states).length > 0) {
            this.publishDelta(this.latestSnapshot.tripName, this.latestSnapshot.states);
            if (this.initialRetainTimer !== null) {
              clearTimeout(this.initialRetainTimer);
            }
            this.initialRetainTimer = window.setTimeout(() => {
              if (!this.destroyed && this.client?.connected && this.latestSnapshot) {
                this.publishState(this.latestSnapshot.tripName, this.latestSnapshot.states);
              }
            }, 600);
          }
        },
      );
      this.startTimers();
    });

    client.on('reconnect', () => {
      if (this.destroyed) return;
      this.callbacks.onStatusChange('reconnecting');
    });

    client.on('offline', () => {
      if (this.destroyed) return;
      this.callbacks.onStatusChange('reconnecting');
    });

    client.on('error', () => {
      if (this.destroyed) return;
      if (!client.connected && this.brokerIndex < BROKERS.length - 1) {
        this.brokerIndex += 1;
        client.end(true);
        this.connect();
      } else {
        this.callbacks.onStatusChange('error');
      }
    });

    client.on('message', (topic, message) => {
      if (this.destroyed) return;
      try {
        const data = JSON.parse(message.toString());
        if (topic === this.stateTopic || topic === this.deltaTopic) {
          const payload = data as SyncPayload;
          if (payload.type === 'state' && payload.senderId !== this.clientId) {
            this.callbacks.onRemoteState(payload);
          }
        } else if (topic === this.syncReqTopic) {
          const req = data as SyncRequestPayload;
          if (req.type === 'sync-req' && req.senderId !== this.clientId) {
            // A newly joined or reconnected peer is requesting the current game state
            if (this.latestSnapshot) {
              const hasStates = Object.keys(this.latestSnapshot.states).length > 0;
              const hasRealName = !this.latestSnapshot.tripName.startsWith('Shared Trip ');
              if (hasStates || hasRealName) {
                this.publishState(this.latestSnapshot.tripName, this.latestSnapshot.states);
              }
            }
            // Also reply with our presence so the new peer immediately sees us online
            this.publishPresence(true);
          }
        } else if (topic.startsWith(`${TOPIC_PREFIX}/${this.roomCode}/presence/`)) {
          const presence = data as PresencePayload;
          if (presence.senderId === this.clientId) return;
          if (presence.online) {
            this.peers.set(presence.senderId, {
              id: presence.senderId,
              name: presence.senderName || 'Road Tripper',
              lastSeen: Date.now(),
            });
          } else {
            this.peers.delete(presence.senderId);
          }
          this.emitPeers();
        }
      } catch {
        // Ignore malformed packets
      }
    });
  }

  public setSnapshot(tripName: string, states: Record<string, SpottedRecord>): void {
    this.latestSnapshot = { tripName, states };
  }

  public updatePlayerName(name: string): void {
    this.playerName = name.trim() || 'Road Tripper';
    if (this.client?.connected) {
      this.publishPresence(true);
    }
  }

  /**
   * Publish merged state to both retained state topic (for late joiners)
   * and live delta topic (for active peers).
   */
  public publishState(tripName: string, states: Record<string, SpottedRecord>): void {
    this.latestSnapshot = { tripName, states };
    if (!this.client?.connected) return;
    const payload: SyncPayload = {
      type: 'state',
      tripName,
      states,
      senderId: this.clientId,
      senderName: this.playerName,
      sentAt: Date.now(),
    };
    const encoded = JSON.stringify(payload);
    this.client.publish(this.stateTopic, encoded, { qos: 0, retain: true });
    this.client.publish(this.deltaTopic, encoded, { qos: 0, retain: false });
  }

  private publishDelta(tripName: string, states: Record<string, SpottedRecord>): void {
    if (!this.client?.connected) return;
    const payload: SyncPayload = {
      type: 'state',
      tripName,
      states,
      senderId: this.clientId,
      senderName: this.playerName,
      sentAt: Date.now(),
    };
    this.client.publish(this.deltaTopic, JSON.stringify(payload), { qos: 0, retain: false });
  }

  private publishSyncRequest(): void {
    if (!this.client?.connected) return;
    const payload: SyncRequestPayload = {
      type: 'sync-req',
      senderId: this.clientId,
      sentAt: Date.now(),
    };
    this.client.publish(this.syncReqTopic, JSON.stringify(payload), { qos: 0, retain: false });
  }

  private publishPresence(online: boolean): void {
    if (!this.client?.connected) return;
    const payload: PresencePayload = {
      type: 'presence',
      senderId: this.clientId,
      senderName: this.playerName,
      online,
      sentAt: Date.now(),
    };
    this.client.publish(this.presenceTopic, JSON.stringify(payload), { qos: 0, retain: false });
  }

  private startTimers(): void {
    this.stopTimers();
    this.heartbeatTimer = window.setInterval(() => {
      this.publishPresence(true);
    }, 15000);
    this.pruneTimer = window.setInterval(() => {
      const cutoff = Date.now() - 40000;
      let changed = false;
      for (const [id, peer] of this.peers.entries()) {
        if (peer.lastSeen < cutoff) {
          this.peers.delete(id);
          changed = true;
        }
      }
      if (changed) this.emitPeers();
    }, 10000);
  }

  private stopTimers(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.pruneTimer !== null) {
      clearInterval(this.pruneTimer);
      this.pruneTimer = null;
    }
    if (this.initialRetainTimer !== null) {
      clearTimeout(this.initialRetainTimer);
      this.initialRetainTimer = null;
    }
  }

  private emitPeers(): void {
    this.callbacks.onPeersChange(Array.from(this.peers.values()));
  }

  public disconnect(): void {
    this.destroyed = true;
    this.stopTimers();
    if (this.client) {
      if (this.client.connected) {
        this.publishPresence(false);
      }
      this.client.end(true);
      this.client = null;
    }
    this.peers.clear();
  }
}

export function buildShareUrl(roomCode: string, tripName: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('join', roomCode.toUpperCase());
  url.searchParams.set('trip', tripName);
  return url.toString();
}
