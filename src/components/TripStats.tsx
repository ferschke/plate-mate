import React, { useMemo } from 'react';
import { Award, Clock, RotateCcw, Users } from 'lucide-react';
import { STATE_BY_CODE, TOTAL_STATES, US_STATES } from '../data/states';
import { computeLifetimeStats, countSeenStates } from '../services/storage';
import type { Trip } from '../types';

interface TripStatsProps {
  trip: Trip;
  allTrips: Trip[];
  onToggleState: (code: string) => void;
  onOpenShare: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const TripStats: React.FC<TripStatsProps> = ({ trip, allTrips, onToggleState, onOpenShare }) => {
  const seenCount = countSeenStates(trip);
  const remaining = TOTAL_STATES - seenCount;
  const pct = Math.round((seenCount / TOTAL_STATES) * 100);
  const lifetime = useMemo(() => computeLifetimeStats(allTrips), [allTrips]);

  const spottedEntries = useMemo(() => {
    return US_STATES.filter((s) => trip.states[s.code]?.seen)
      .map((s) => ({
        state: s,
        record: trip.states[s.code],
      }))
      .sort((a, b) => b.record.updatedAt - a.record.updatedAt);
  }, [trip.states]);

  const leaderboard = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of spottedEntries) {
      const name = entry.record.spottedBy?.trim() || 'You';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [spottedEntries]);

  return (
    <div className="stats-view">
      {/* Trip Summary Cards */}
      <div className="stats-summary-grid">
        <div className="stat-box">
          <span className="stat-box-value">{seenCount}</span>
          <span className="stat-box-label">Spotted</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-value">{remaining}</span>
          <span className="stat-box-label">To Go</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-value">{pct}%</span>
          <span className="stat-box-label">Complete</span>
        </div>
      </div>

      {/* Crew Leaderboard */}
      <div className="surface-card">
        <div className="card-heading-row">
          <h2 className="section-title">
            <Award size={18} className="inline-icon" /> Spotter Leaderboard
          </h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenShare}>
            <Users size={14} /> {trip.roomCode ? `Code: ${trip.roomCode}` : 'Invite Crew'}
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <p className="muted-copy">Spot your first license plate to kick off the scoreboard.</p>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map(([name, count], idx) => {
              const barPct = Math.round((count / Math.max(1, seenCount)) * 100);
              return (
                <div key={name} className="leaderboard-row">
                  <div className="leaderboard-top">
                    <span className="leaderboard-rank">#{idx + 1}</span>
                    <span className="leaderboard-name">{name}</span>
                    <span className="leaderboard-score">
                      {count} {count === 1 ? 'state' : 'states'}
                    </span>
                  </div>
                  <div className="progress-track progress-track-sm">
                    <div className="progress-fill" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spotting Timeline */}
      <div className="surface-card">
        <div className="card-heading-row">
          <h2 className="section-title">
            <Clock size={18} className="inline-icon" /> Recent Spottings
          </h2>
          <span className="count-pill">{spottedEntries.length}</span>
        </div>

        {spottedEntries.length === 0 ? (
          <p className="muted-copy">No states spotted on this trip yet. Head to Plates or Map to start tapping!</p>
        ) : (
          <ul className="timeline-list">
            {spottedEntries.map(({ state, record }) => {
              const info = STATE_BY_CODE[state.code];
              return (
                <li key={state.code} className="timeline-item">
                  <div className="timeline-badge">{state.code}</div>
                  <div className="timeline-info">
                    <strong>{info.name}</strong>
                    <span>
                      Spotted by {record.spottedBy || 'You'} · {formatTime(record.updatedAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    title={`Unmark ${info.name}`}
                    aria-label={`Unmark ${info.name}`}
                    onClick={() => onToggleState(state.code)}
                  >
                    <RotateCcw size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* All-Time Stats */}
      <div className="surface-card">
        <h2 className="section-title">All-Time Stats</h2>
        <div className="alltime-grid">
          <div className="alltime-item">
            <span className="alltime-num">{lifetime.uniqueStatesEverSeen} / 50</span>
            <span className="alltime-lbl">Unique States Across All Trips</span>
          </div>
          <div className="alltime-item">
            <span className="alltime-num">{lifetime.bestTripCount}</span>
            <span className="alltime-lbl">Single-Trip Record</span>
          </div>
          <div className="alltime-item">
            <span className="alltime-num">{lifetime.totalSpottings}</span>
            <span className="alltime-lbl">Total Plates Spotted</span>
          </div>
          <div className="alltime-item">
            <span className="alltime-num">{lifetime.totalTrips}</span>
            <span className="alltime-lbl">Saved Trips</span>
          </div>
        </div>
      </div>
    </div>
  );
};
