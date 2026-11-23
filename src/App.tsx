import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Check,
  Grid,
  Map as MapIcon,
  Moon,
  Search,
  Sparkles,
  Sun,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { LicensePlate } from './components/LicensePlate';
import { NicknamePromptModal } from './components/NicknamePromptModal';
import { ShareModal } from './components/ShareModal';
import { TripsHub } from './components/TripsHub';
import { TripStats } from './components/TripStats';
import { USMap } from './components/USMap';
import { STATE_BY_CODE, TOTAL_STATES, US_STATES } from './data/states';
import {
  countSeenStates,
  createNewTrip,
  generateRoomCode,
  loadPersistedState,
  mergeStateRecords,
  normalizeRoomCode,
  savePersistedState,
} from './services/storage';
import { TripSyncClient, type SyncPayload } from './services/sync';
import type { OnlinePeer, PersistedState, SyncStatus, Trip } from './types';

type ActiveTab = 'plates' | 'map' | 'stats';
type PlateFilter = 'all' | 'unseen' | 'seen';
type PlateSort = 'alpha' | 'unseen-first' | 'recent';

interface ToastMessage {
  id: number;
  text: string;
  undoCode?: string;
}

interface PendingJoin {
  roomCode: string;
  tripName: string;
}

interface InitialBootState {
  persisted: PersistedState;
  pendingJoin: PendingJoin | null;
}

function loadInitialBootState(): InitialBootState {
  const loaded = loadPersistedState();
  const params = new URLSearchParams(window.location.search);
  const rawJoin = params.get('join');
  if (!rawJoin) return { persisted: loaded, pendingJoin: null };

  const code = normalizeRoomCode(rawJoin);
  if (code.length < 4) return { persisted: loaded, pendingJoin: null };

  const incomingTripName = params.get('trip')?.trim() || `Shared Trip ${code}`;
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('join');
  cleanUrl.searchParams.delete('trip');
  window.history.replaceState({}, '', cleanUrl.toString());

  // If the player hasn't chosen a nickname yet, ask them before entering the shared trip
  const savedName = loaded.settings.playerName.trim();
  if (!savedName) {
    return {
      persisted: loaded,
      pendingJoin: { roomCode: code, tripName: incomingTripName },
    };
  }

  const existing = loaded.trips.find((t) => t.roomCode === code);
  if (existing) {
    return {
      persisted: { ...loaded, activeTripId: existing.id },
      pendingJoin: null,
    };
  }

  const joined = createNewTrip(incomingTripName, {
    roomCode: code,
    creatorName: savedName,
  });
  return {
    persisted: {
      ...loaded,
      trips: [joined, ...loaded.trips],
      activeTripId: joined.id,
    },
    pendingJoin: null,
  };
}

export function App() {
  const [initialBoot] = useState<InitialBootState>(() => loadInitialBootState());
  const [appState, setAppState] = useState<PersistedState>(() => initialBoot.persisted);
  const [pendingJoin, setPendingJoin] = useState<PendingJoin | null>(() => initialBoot.pendingJoin);
  const [activeTab, setActiveTab] = useState<ActiveTab>('plates');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PlateFilter>('all');
  const [sort, setSort] = useState<PlateSort>('alpha');
  const [showShareModal, setShowShareModal] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [onlinePeers, setOnlinePeers] = useState<OnlinePeer[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const syncClientRef = useRef<TripSyncClient | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, undoCode?: string) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), text, undoCode });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Persist to localStorage on every state update
  useEffect(() => {
    savePersistedState(appState);
  }, [appState]);

  // Apply Day / Night Drive theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = appState.settings.theme;
  }, [appState.settings.theme]);

  const activeTrip: Trip | null = useMemo(() => {
    if (!appState.activeTripId) return null;
    return appState.trips.find((t) => t.id === appState.activeTripId) ?? null;
  }, [appState.trips, appState.activeTripId]);

  const activeTripId = activeTrip?.id ?? null;
  const activeRoomCode = activeTrip?.roomCode ?? null;

  const activeTripRef = useRef<Trip | null>(null);
  const playerNameRef = useRef<string>(appState.settings.playerName || 'Road Tripper');

  useEffect(() => {
    activeTripRef.current = activeTrip;
    playerNameRef.current = appState.settings.playerName || 'Road Tripper';
    if (activeTrip && syncClientRef.current) {
      syncClientRef.current.setSnapshot(activeTrip.name, activeTrip.states);
    }
  }, [activeTrip, appState.settings.playerName]);

  // Manage real-time MQTT multiplayer sync when activeTrip has a roomCode
  useEffect(() => {
    if (!activeTripId || !activeRoomCode) {
      if (syncClientRef.current) {
        syncClientRef.current.disconnect();
        syncClientRef.current = null;
      }
      return;
    }

    const client = new TripSyncClient(
      activeRoomCode,
      playerNameRef.current,
      {
        onStatusChange: (status) => setSyncStatus(status),
        onPeersChange: (peers) => setOnlinePeers(peers),
        onRemoteState: (payload: SyncPayload) => {
          setAppState((prev) => {
            const idx = prev.trips.findIndex((t) => t.id === activeTripId);
            if (idx === -1) return prev;
            const current = prev.trips[idx];
            const { merged, changed } = mergeStateRecords(current.states, payload.states);

            // Detect newly seen states from remote peers for toast feedback
            if (changed) {
              const newlySeenList = Object.entries(payload.states).filter(
                ([code, rec]) => rec.seen && !current.states[code]?.seen && merged[code]?.seen,
              );
              if (newlySeenList.length === 1) {
                const [code, rec] = newlySeenList[0];
                const st = STATE_BY_CODE[code];
                if (st) {
                  showToast(`${rec.spottedBy || payload.senderName} spotted ${st.name}!`);
                }
              } else if (newlySeenList.length > 1) {
                showToast(`Synced ${newlySeenList.length} spotted states!`);
              }
            }

            const updatedName =
              current.name.startsWith('Shared Trip ') && payload.tripName && !payload.tripName.startsWith('Shared Trip ')
                ? payload.tripName
                : current.name;

            if (!changed && updatedName === current.name) return prev;

            const updatedTrip: Trip = {
              ...current,
              name: updatedName,
              states: merged,
              updatedAt: Date.now(),
            };
            client.setSnapshot(updatedTrip.name, updatedTrip.states);

            const nextTrips = [...prev.trips];
            nextTrips[idx] = updatedTrip;
            return { ...prev, trips: nextTrips };
          });
        },
      },
    );

    syncClientRef.current = client;
    const snap = activeTripRef.current;
    client.connect(snap ? { tripName: snap.name, states: snap.states } : undefined);

    return () => {
      client.disconnect();
      if (syncClientRef.current === client) {
        syncClientRef.current = null;
      }
    };
  }, [activeTripId, activeRoomCode, showToast]);

  const effectiveSyncStatus: SyncStatus = activeRoomCode ? syncStatus : 'idle';
  const effectiveOnlinePeers: OnlinePeer[] = activeRoomCode ? onlinePeers : [];

  // Update player name on active sync client when changed
  useEffect(() => {
    if (syncClientRef.current && appState.settings.playerName) {
      syncClientRef.current.updatePlayerName(appState.settings.playerName);
    }
  }, [appState.settings.playerName]);

  const handleToggleTheme = () => {
    setAppState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'day' ? 'night' : 'day',
      },
    }));
  };

  const handleUpdatePlayerName = (name: string) => {
    setAppState((prev) => ({
      ...prev,
      settings: { ...prev.settings, playerName: name },
    }));
    showToast(`Nickname saved as "${name}"`);
  };

  const handleCreateTrip = (name: string, shared: boolean, playerName: string) => {
    const cleanName = playerName.trim();
    const roomCode = shared ? generateRoomCode() : undefined;
    const trip = createNewTrip(name, { roomCode, creatorName: cleanName || undefined });
    setAppState((prev) => ({
      ...prev,
      trips: [trip, ...prev.trips],
      activeTripId: trip.id,
      settings: {
        ...prev.settings,
        playerName: cleanName || prev.settings.playerName,
      },
    }));
    setActiveTab('plates');
    setSearchQuery('');
    setFilter('all');
    if (shared) {
      setShowShareModal(true);
    }
  };

  const handleJoinTrip = (roomCode: string, tripName: string, playerName: string) => {
    const clean = normalizeRoomCode(roomCode);
    const cleanName = playerName.trim();
    setAppState((prev) => {
      const effectiveName = cleanName || prev.settings.playerName;
      const existing = prev.trips.find((t) => t.roomCode === clean);
      if (existing) {
        return {
          ...prev,
          activeTripId: existing.id,
          settings: { ...prev.settings, playerName: effectiveName },
        };
      }
      const trip = createNewTrip(tripName, { roomCode: clean, creatorName: effectiveName || undefined });
      return {
        ...prev,
        trips: [trip, ...prev.trips],
        activeTripId: trip.id,
        settings: { ...prev.settings, playerName: effectiveName },
      };
    });
    setActiveTab('plates');
    showToast(`Connecting to shared trip ${clean}…`);
  };

  const handleConfirmPendingJoin = (nickname: string) => {
    if (!pendingJoin) return;
    const { roomCode, tripName } = pendingJoin;
    setPendingJoin(null);
    handleJoinTrip(roomCode, tripName, nickname);
  };

  const handleSelectTrip = (tripId: string) => {
    setAppState((prev) => ({ ...prev, activeTripId: tripId }));
    setActiveTab('plates');
    setSearchQuery('');
    setFilter('all');
  };

  const handleRenameTrip = (tripId: string, newName: string) => {
    setAppState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, name: newName, updatedAt: Date.now() } : t,
      ),
    }));
  };

  const handleDeleteTrip = (tripId: string) => {
    setAppState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== tripId),
      activeTripId: prev.activeTripId === tripId ? null : prev.activeTripId,
    }));
  };

  const handleEnableMultiplayer = (nickname?: string) => {
    if (!activeTrip || activeTrip.roomCode) return;
    const cleanName = nickname?.trim();
    const roomCode = generateRoomCode();
    setAppState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        playerName: cleanName || prev.settings.playerName,
      },
      trips: prev.trips.map((t) =>
        t.id === activeTrip.id ? { ...t, roomCode, updatedAt: Date.now() } : t,
      ),
    }));
    showToast(`Live trip created! Code: ${roomCode}`);
  };

  const handleToggleState = useCallback(
    (code: string, isUndo = false) => {
      const stInfo = STATE_BY_CODE[code];
      if (!stInfo) return;

      let nextSeen = false;
      let updatedTripForSync: Trip | null = null;

      setAppState((prev) => {
        if (!prev.activeTripId) return prev;
        const idx = prev.trips.findIndex((t) => t.id === prev.activeTripId);
        if (idx === -1) return prev;

        const trip = prev.trips[idx];
        const currentlySeen = Boolean(trip.states[code]?.seen);
        nextSeen = !currentlySeen;

        const now = Date.now();
        const nextStates = {
          ...trip.states,
          [code]: {
            seen: nextSeen,
            updatedAt: now,
            spottedBy: prev.settings.playerName || 'You',
          },
        };

        const updatedTrip: Trip = {
          ...trip,
          states: nextStates,
          updatedAt: now,
        };
        updatedTripForSync = updatedTrip;

        const nextTrips = [...prev.trips];
        nextTrips[idx] = updatedTrip;
        return { ...prev, trips: nextTrips };
      });

      // Publish to multiplayer peers after state update
      setTimeout(() => {
        if (updatedTripForSync && syncClientRef.current) {
          syncClientRef.current.publishState(updatedTripForSync.name, updatedTripForSync.states);
        }
      }, 0);

      if (!isUndo) {
        showToast(
          nextSeen ? `Spotted ${stInfo.name}!` : `Removed ${stInfo.name}`,
          code,
        );
      }
    },
    [showToast],
  );

  const seenCount = activeTrip ? countSeenStates(activeTrip) : 0;
  const progressPct = Math.round((seenCount / TOTAL_STATES) * 100);

  const filteredStates = useMemo(() => {
    if (!activeTrip) return [];
    const q = searchQuery.trim().toLowerCase();

    const list = US_STATES.filter((st) => {
      const isSeen = Boolean(activeTrip.states[st.code]?.seen);
      if (filter === 'seen' && !isSeen) return false;
      if (filter === 'unseen' && isSeen) return false;
      if (!q) return true;
      return (
        st.name.toLowerCase().includes(q) ||
        st.code.toLowerCase().includes(q) ||
        st.slogan.toLowerCase().includes(q)
      );
    });

    if (sort === 'unseen-first') {
      return [...list].sort((a, b) => {
        const aSeen = activeTrip.states[a.code]?.seen ? 1 : 0;
        const bSeen = activeTrip.states[b.code]?.seen ? 1 : 0;
        if (aSeen !== bSeen) return aSeen - bSeen;
        return a.name.localeCompare(b.name);
      });
    }

    if (sort === 'recent') {
      return [...list].sort((a, b) => {
        const aTime = activeTrip.states[a.code]?.seen ? activeTrip.states[a.code].updatedAt : 0;
        const bTime = activeTrip.states[b.code]?.seen ? activeTrip.states[b.code].updatedAt : 0;
        if (aTime !== bTime) return bTime - aTime;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [activeTrip, searchQuery, filter, sort]);

  return (
    <div className="app-shell">
      {/* Top App Bar */}
      <header className="top-bar">
        <div className="top-bar-inner">
          {activeTrip ? (
            <button
              type="button"
              id="back-to-trips-btn"
              className="icon-btn back-btn"
              onClick={() => setAppState((prev) => ({ ...prev, activeTripId: null }))}
              aria-label="Back to trips"
            >
              <ArrowLeft size={20} />
              <span className="back-label">Trips</span>
            </button>
          ) : (
            <div className="brand-mark">
              <span className="brand-plate-icon" aria-hidden="true">
                50
              </span>
              <span className="brand-name">Plate Mate</span>
            </div>
          )}

          {activeTrip && (
            <div className="top-bar-trip-title" title={activeTrip.name}>
              <span>{activeTrip.name}</span>
            </div>
          )}

          <div className="top-bar-actions">
            {activeTrip && (
              <button
                type="button"
                id="open-share-modal-btn"
                className={`sync-pill ${activeTrip.roomCode ? `status-${effectiveSyncStatus}` : ''}`}
                onClick={() => setShowShareModal(true)}
                title="Share or sync trip with other phones"
              >
                {activeTrip.roomCode ? (
                  <>
                    {effectiveSyncStatus === 'connected' ? <Wifi size={14} /> : <WifiOff size={14} />}
                    <span>{effectiveOnlinePeers.length + 1}</span>
                  </>
                ) : (
                  <>
                    <Users size={14} />
                    <span className="sync-pill-text">Co-op</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              id="theme-toggle-btn"
              className="icon-btn"
              onClick={handleToggleTheme}
              aria-label={appState.settings.theme === 'day' ? 'Switch to Night Drive mode' : 'Switch to Day mode'}
              title={appState.settings.theme === 'day' ? 'Night Drive mode' : 'Daylight mode'}
            >
              {appState.settings.theme === 'day' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!activeTrip ? (
          <TripsHub
            trips={appState.trips}
            playerName={appState.settings.playerName}
            onCreateTrip={handleCreateTrip}
            onJoinTrip={handleJoinTrip}
            onSelectTrip={handleSelectTrip}
            onRenameTrip={handleRenameTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        ) : (
          <div className="trip-workspace">
            {/* Compact Sticky Counter Banner */}
            <section className="counter-banner" aria-live="polite">
              <div className="counter-banner-top">
                <div className="counter-readout">
                  <span className="counter-big">{seenCount}</span>
                  <span className="counter-of">/ {TOTAL_STATES} states</span>
                </div>
                <div className="counter-right">
                  {seenCount === TOTAL_STATES ? (
                    <span className="complete-badge">
                      <Sparkles size={14} /> All 50 Complete!
                    </span>
                  ) : (
                    <span className="counter-pct">{progressPct}%</span>
                  )}
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </section>

            {/* Tab Content */}
            {activeTab === 'plates' && (
              <section className="plates-section">
                {/* Search, Filter & Sort Toolbar */}
                <div className="plates-toolbar">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      id="plate-search-input"
                      type="search"
                      className="search-input"
                      placeholder="Search state, code, or slogan…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="search-clear"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="filter-sort-row">
                    <div className="filter-chips" role="tablist" aria-label="Filter plates">
                      <button
                        type="button"
                        className={`filter-chip ${filter === 'all' ? 'is-active' : ''}`}
                        onClick={() => setFilter('all')}
                      >
                        All ({TOTAL_STATES})
                      </button>
                      <button
                        type="button"
                        className={`filter-chip ${filter === 'unseen' ? 'is-active' : ''}`}
                        onClick={() => setFilter('unseen')}
                      >
                        Unseen ({TOTAL_STATES - seenCount})
                      </button>
                      <button
                        type="button"
                        className={`filter-chip ${filter === 'seen' ? 'is-active' : ''}`}
                        onClick={() => setFilter('seen')}
                      >
                        Seen ({seenCount})
                      </button>
                    </div>

                    <select
                      id="plate-sort-select"
                      className="sort-select"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as PlateSort)}
                      aria-label="Sort license plates"
                    >
                      <option value="alpha">A – Z</option>
                      <option value="unseen-first">Unseen First</option>
                      <option value="recent">Recently Spotted</option>
                    </select>
                  </div>
                </div>

                {/* 50-State License Plate Grid */}
                {filteredStates.length === 0 ? (
                  <div className="empty-filter-box">
                    <p>No states match your filter.</p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilter('all');
                      }}
                    >
                      Show All 50 States
                    </button>
                  </div>
                ) : (
                  <div className="plates-grid">
                    {filteredStates.map((state) => {
                      const rec = activeTrip.states[state.code];
                      const isSeen = Boolean(rec?.seen);
                      return (
                        <button
                          key={state.code}
                          type="button"
                          id={`plate-card-${state.code}`}
                          className={`plate-card ${isSeen ? 'is-seen' : ''}`}
                          onClick={() => handleToggleState(state.code)}
                          aria-pressed={isSeen}
                        >
                          <div className="plate-visual-wrap">
                            <LicensePlate state={state} seen={isSeen} />
                            {isSeen && (
                              <span className="plate-check-badge" aria-hidden="true">
                                <Check size={14} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div className="plate-card-footer">
                            <span className="plate-state-name">{state.name}</span>
                            <span className="plate-state-sub">
                              {isSeen && rec?.spottedBy && activeTrip.roomCode
                                ? rec.spottedBy
                                : state.code}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'map' && (
              <USMap states={activeTrip.states} onToggleState={(code) => handleToggleState(code)} />
            )}

            {activeTab === 'stats' && (
              <TripStats
                trip={activeTrip}
                allTrips={appState.trips}
                onToggleState={(code) => handleToggleState(code)}
                onOpenShare={() => setShowShareModal(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Tab Navigation (shown when inside a trip) */}
      {activeTrip && (
        <nav className="bottom-nav" aria-label="Trip navigation">
          <button
            type="button"
            id="nav-plates-btn"
            className={`bottom-nav-item ${activeTab === 'plates' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('plates')}
          >
            <Grid size={20} />
            <span>Plates</span>
          </button>
          <button
            type="button"
            id="nav-map-btn"
            className={`bottom-nav-item ${activeTab === 'map' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <MapIcon size={20} />
            <span>US Map</span>
          </button>
          <button
            type="button"
            id="nav-stats-btn"
            className={`bottom-nav-item ${activeTab === 'stats' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </button>
        </nav>
      )}

      {/* Nickname Prompt for New Players Joining via Invite Link / QR */}
      {pendingJoin && (
        <NicknamePromptModal
          tripName={pendingJoin.tripName}
          roomCode={pendingJoin.roomCode}
          onConfirm={handleConfirmPendingJoin}
          onCancel={() => setPendingJoin(null)}
        />
      )}

      {/* Share / Multiplayer Modal */}
      {showShareModal && activeTrip && (
        <ShareModal
          trip={activeTrip}
          playerName={appState.settings.playerName}
          syncStatus={effectiveSyncStatus}
          onlinePeers={effectiveOnlinePeers}
          onEnableMultiplayer={handleEnableMultiplayer}
          onUpdatePlayerName={handleUpdatePlayerName}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Tactile Toast with Undo */}
      {toast && (
        <div className="toast-banner" role="status" aria-live="polite">
          <span>{toast.text}</span>
          {toast.undoCode && (
            <button
              type="button"
              className="toast-undo-btn"
              onClick={() => {
                const code = toast.undoCode!;
                setToast(null);
                handleToggleState(code, true);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
