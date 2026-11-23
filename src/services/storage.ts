import { US_STATES } from '../data/states';
import type { AppSettings, PersistedState, SpottedRecord, Trip } from '../types';

const STORAGE_KEY = 'plate_mate_state_v1';

const DEFAULT_SETTINGS: AppSettings = {
  playerName: '',
  theme: 'day',
};

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function createNewTrip(name: string, options?: { roomCode?: string; creatorName?: string }): Trip {
  const now = Date.now();
  return {
    id: generateId(),
    name: name.trim() || 'Road Trip',
    createdAt: now,
    updatedAt: now,
    states: {},
    roomCode: options?.roomCode ? normalizeRoomCode(options.roomCode) : undefined,
    members: options?.creatorName?.trim() ? [options.creatorName.trim()] : [],
  };
}

export function countSeenStates(trip: Trip): number {
  let count = 0;
  for (const state of US_STATES) {
    if (trip.states[state.code]?.seen) {
      count += 1;
    }
  }
  return count;
}

export function getSeenStateCodes(trip: Trip): Set<string> {
  const set = new Set<string>();
  for (const state of US_STATES) {
    if (trip.states[state.code]?.seen) {
      set.add(state.code);
    }
  }
  return set;
}

/**
 * Conflict-free Last-Write-Wins (LWW) CRDT merge of two trip state maps.
 * Guarantees that concurrent updates from multiple phones or offline reconnections
 * converge deterministically without losing progress.
 */
export function mergeStateRecords(
  local: Record<string, SpottedRecord>,
  remote: Record<string, SpottedRecord>,
): { merged: Record<string, SpottedRecord>; changed: boolean } {
  const merged: Record<string, SpottedRecord> = { ...local };
  let changed = false;

  for (const [code, remoteRec] of Object.entries(remote)) {
    if (!remoteRec || typeof remoteRec.updatedAt !== 'number') continue;
    const localRec = merged[code];
    if (
      !localRec ||
      remoteRec.updatedAt > localRec.updatedAt ||
      (remoteRec.updatedAt === localRec.updatedAt && remoteRec.seen && !localRec.seen)
    ) {
      if (
        !localRec ||
        localRec.seen !== remoteRec.seen ||
        localRec.updatedAt !== remoteRec.updatedAt ||
        localRec.spottedBy !== remoteRec.spottedBy
      ) {
        merged[code] = { ...remoteRec };
        changed = true;
      }
    }
  }

  return { merged, changed };
}

export function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: 1,
        trips: [],
        activeTripId: null,
        settings: { ...DEFAULT_SETTINGS },
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      version: 1,
      trips: Array.isArray(parsed.trips) ? parsed.trips : [],
      activeTripId: typeof parsed.activeTripId === 'string' ? parsed.activeTripId : null,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    return {
      version: 1,
      trips: [],
      activeTripId: null,
      settings: { ...DEFAULT_SETTINGS },
    };
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export interface LifetimeStats {
  totalTrips: number;
  uniqueStatesEverSeen: number;
  bestTripCount: number;
  totalSpottings: number;
}

export function computeLifetimeStats(trips: Trip[]): LifetimeStats {
  const uniqueSeen = new Set<string>();
  let bestTripCount = 0;
  let totalSpottings = 0;

  for (const trip of trips) {
    const count = countSeenStates(trip);
    if (count > bestTripCount) bestTripCount = count;
    totalSpottings += count;
    for (const state of US_STATES) {
      if (trip.states[state.code]?.seen) {
        uniqueSeen.add(state.code);
      }
    }
  }

  return {
    totalTrips: trips.length,
    uniqueStatesEverSeen: uniqueSeen.size,
    bestTripCount,
    totalSpottings,
  };
}
