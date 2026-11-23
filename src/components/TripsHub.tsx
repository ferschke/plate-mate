import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Edit3,
  Plus,
  Radio,
  Trash2,
  Trophy,
  Users,
  Check,
  X,
} from 'lucide-react';
import { TOTAL_STATES } from '../data/states';
import { computeLifetimeStats, countSeenStates, normalizeRoomCode } from '../services/storage';
import type { Trip } from '../types';

interface TripsHubProps {
  trips: Trip[];
  playerName: string;
  onCreateTrip: (name: string, shared: boolean, playerName: string) => void;
  onJoinTrip: (roomCode: string, tripName: string, playerName: string) => void;
  onSelectTrip: (tripId: string) => void;
  onRenameTrip: (tripId: string, newName: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

function formatTripDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const TripsHub: React.FC<TripsHubProps> = ({
  trips,
  playerName,
  onCreateTrip,
  onJoinTrip,
  onSelectTrip,
  onRenameTrip,
  onDeleteTrip,
}) => {
  const [newTripName, setNewTripName] = useState('');
  const [nameDraft, setNameDraft] = useState(playerName);
  const [startShared, setStartShared] = useState(false);

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState(playerName);

  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = computeLifetimeStats(trips);

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultName = `Road Trip ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    onCreateTrip(newTripName.trim() || defaultName, startShared, nameDraft.trim() || 'Road Tripper');
    setNewTripName('');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(joinCode);
    if (clean.length < 4) return;
    onJoinTrip(clean, `Shared Trip ${clean}`, joinName.trim() || 'Road Tripper');
    setJoinCode('');
    setShowJoinForm(false);
  };

  const startRename = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTripId(trip.id);
    setEditTitle(trip.name);
    setConfirmDeleteId(null);
  };

  const commitRename = (tripId: string) => {
    if (editTitle.trim()) {
      onRenameTrip(tripId, editTitle.trim());
    }
    setEditingTripId(null);
  };

  const sortedTrips = [...trips].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="hub-container">
      {/* Hero Intro */}
      <section className="hub-hero">
        <div className="hub-hero-badge">
          <Compass size={16} />
          <span>50-State Road Trip Game</span>
        </div>
        <h1 className="hub-title">Spot every state on the open road.</h1>
        <p className="hub-subtitle">
          Track authentic US license plates as you drive, watch your map fill in, and play live with everyone in the car.
        </p>

        {trips.length > 0 && (
          <div className="lifetime-strip" aria-label="Lifetime road trip statistics">
            <div className="lifetime-stat">
              <span className="lifetime-value">{stats.uniqueStatesEverSeen}/50</span>
              <span className="lifetime-label">All-Time States</span>
            </div>
            <div className="lifetime-divider" />
            <div className="lifetime-stat">
              <span className="lifetime-value">{stats.bestTripCount}</span>
              <span className="lifetime-label">Best Trip</span>
            </div>
            <div className="lifetime-divider" />
            <div className="lifetime-stat">
              <span className="lifetime-value">{stats.totalTrips}</span>
              <span className="lifetime-label">{stats.totalTrips === 1 ? 'Trip' : 'Trips'}</span>
            </div>
          </div>
        )}
      </section>

      {/* Primary Action Grid: Start New Trip + Join Shared Trip */}
      <section className="hub-actions-grid">
        <form className="surface-card start-trip-card" onSubmit={handleStartSubmit}>
          <div className="card-heading-row">
            <h2 className="section-title">Start a New Trip</h2>
          </div>

          <div className="form-group">
            <label htmlFor="new-trip-name" className="field-label">
              Trip Name
            </label>
            <input
              id="new-trip-name"
              type="text"
              className="text-input"
              placeholder="e.g. Pacific Coast Highway, Thanksgiving Drive"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              maxLength={48}
            />
          </div>

          <div className="form-group">
            <label htmlFor="creator-name" className="field-label">
              Your Nickname
            </label>
            <input
              id="creator-name"
              type="text"
              className="text-input"
              placeholder="e.g. Alex"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={24}
            />
          </div>

          <label className="toggle-row" htmlFor="start-shared-checkbox">
            <input
              id="start-shared-checkbox"
              type="checkbox"
              checked={startShared}
              onChange={(e) => setStartShared(e.target.checked)}
            />
            <span className="toggle-copy">
              <strong>Play together (Multiplayer)</strong>
              <span>Create a live join code &amp; QR code for other phones in the car</span>
            </span>
          </label>

          <button type="submit" id="start-new-trip-btn" className="btn btn-primary btn-full">
            <Plus size={18} /> Start Trip
          </button>
        </form>

        <div className="surface-card join-trip-card">
          <div className="card-heading-row">
            <h2 className="section-title">Join a Shared Trip</h2>
            <Users size={18} className="muted-icon" />
          </div>
          <p className="card-desc">
            Riding with friends or family? Enter their 6-character trip code to sync progress from your own phone.
          </p>

          {!showJoinForm ? (
            <button
              type="button"
              id="open-join-trip-btn"
              className="btn btn-secondary btn-full"
              onClick={() => setShowJoinForm(true)}
            >
              <Radio size={17} /> Enter Trip Code
            </button>
          ) : (
            <form className="join-form" onSubmit={handleJoinSubmit}>
              <div className="form-group">
                <label htmlFor="join-code-input" className="field-label">
                  6-Character Trip Code
                </label>
                <input
                  id="join-code-input"
                  type="text"
                  className="text-input code-input"
                  placeholder="e.g. K7M4P2"
                  value={joinCode}
                  onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
                  maxLength={8}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="join-nickname-input" className="field-label">
                  Your Nickname
                </label>
                <input
                  id="join-nickname-input"
                  type="text"
                  className="text-input"
                  placeholder="e.g. Sam"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  maxLength={24}
                />
              </div>
              <div className="button-row">
                <button type="submit" id="confirm-join-trip-btn" className="btn btn-primary" disabled={joinCode.length < 4}>
                  Join Live Trip
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowJoinForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Saved Trips List */}
      <section className="saved-trips-section">
        <div className="section-header-row">
          <h2 className="section-title">Your Trips</h2>
          <span className="count-pill">{trips.length}</span>
        </div>

        {sortedTrips.length === 0 ? (
          <div className="empty-trips-card">
            <Trophy size={28} className="muted-icon" />
            <h3>No trips saved yet</h3>
            <p>Start your first road trip above — all progress is saved automatically on your phone.</p>
          </div>
        ) : (
          <div className="trips-list">
            {sortedTrips.map((trip) => {
              const seenCount = countSeenStates(trip);
              const pct = Math.round((seenCount / TOTAL_STATES) * 100);
              const isEditing = editingTripId === trip.id;
              const isConfirmingDelete = confirmDeleteId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="trip-card"
                  onClick={() => {
                    if (!isEditing && !isConfirmingDelete) onSelectTrip(trip.id);
                  }}
                >
                  <div className="trip-card-main">
                    <div className="trip-card-top">
                      {isEditing ? (
                        <div className="inline-edit-row" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            className="text-input text-input-sm"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(trip.id);
                              if (e.key === 'Escape') setEditingTripId(null);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="icon-btn icon-btn-accent"
                            onClick={() => commitRename(trip.id)}
                            aria-label="Save name"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setEditingTripId(null)}
                            aria-label="Cancel rename"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="trip-title-wrap">
                            <h3 className="trip-name">{trip.name}</h3>
                            {trip.roomCode && (
                              <span className="shared-tag" title={`Shared code: ${trip.roomCode}`}>
                                <Users size={12} /> {trip.roomCode}
                              </span>
                            )}
                          </div>
                          <div className="trip-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={(e) => startRename(trip, e)}
                              aria-label={`Rename ${trip.name}`}
                              title="Rename trip"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : trip.id)}
                              aria-label={`Delete ${trip.name}`}
                              title="Delete trip"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="trip-meta-row">
                      <span>Updated {formatTripDate(trip.updatedAt)}</span>
                      <strong className="trip-score">
                        {seenCount} / {TOTAL_STATES} states ({pct}%)
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>

                    {isConfirmingDelete ? (
                      <div className="delete-confirm-bar" onClick={(e) => e.stopPropagation()}>
                        <span>Delete this trip permanently?</span>
                        <div className="button-row">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              onDeleteTrip(trip.id);
                              setConfirmDeleteId(null);
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="trip-continue-row">
                        <span className="continue-link">
                          Continue Trip <ArrowRight size={15} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
