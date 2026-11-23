export type USRegion = 'Northeast' | 'Midwest' | 'South' | 'West';

export interface StateInfo {
  code: string;
  fips: string;
  name: string;
  region: USRegion;
  slogan: string;
  sampleSerial: string;
  headerText?: string;
  headerStyle?: 'bold' | 'script' | 'serif' | 'caps';
  bgTop: string;
  bgMid?: string;
  bgBottom: string;
  textColor: string;
  headerColor: string;
  sloganColor: string;
  borderColor?: string;
  stickerLeft?: string;
  stickerRight?: string;
}

export interface SpottedRecord {
  seen: boolean;
  updatedAt: number;
  spottedBy: string;
}

export interface Trip {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Map of 2-letter state code -> SpottedRecord (LWW CRDT per state) */
  states: Record<string, SpottedRecord>;
  /** Optional 6-char shared room code for multiplayer sync */
  roomCode?: string;
  /** Optional list of known player nicknames in this trip */
  members?: string[];
}

export interface AppSettings {
  playerName: string;
  theme: 'day' | 'night';
}

export interface PersistedState {
  version: 1;
  trips: Trip[];
  activeTripId: string | null;
  settings: AppSettings;
}

export type SyncStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface OnlinePeer {
  id: string;
  name: string;
  lastSeen: number;
}
