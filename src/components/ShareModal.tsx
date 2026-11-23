import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Radio, Share2, Users, Wifi, WifiOff, X } from 'lucide-react';
import { buildShareUrl } from '../services/sync';
import type { OnlinePeer, SyncStatus, Trip } from '../types';

interface ShareModalProps {
  trip: Trip;
  playerName: string;
  syncStatus: SyncStatus;
  onlinePeers: OnlinePeer[];
  onEnableMultiplayer: () => void;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  trip,
  playerName,
  syncStatus,
  onlinePeers,
  onEnableMultiplayer,
  onUpdatePlayerName,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  const shareUrl = trip.roomCode ? buildShareUrl(trip.roomCode, trip.name) : '';

  useEffect(() => {
    if (!shareUrl) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#17212B', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const visibleQrUrl = shareUrl ? qrDataUrl : '';

  const handleCopyCode = async () => {
    if (!trip.roomCode) return;
    try {
      await navigator.clipboard.writeText(trip.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleShareLink = async () => {
    if (!shareUrl || !trip.roomCode) return;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Join "${trip.name}" on Plate Mate`,
          text: `Spot US license plates together! Trip code: ${trip.roomCode}`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed; fall back to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlayerName(nameInput.trim() || 'Road Tripper');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Users size={20} className="modal-icon" />
            <h2 id="share-modal-title">Play Together</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form className="nickname-row" onSubmit={handleSaveName}>
          <label htmlFor="player-nickname-input" className="field-label">
            Your Name (shown when you spot a plate)
          </label>
          <div className="input-with-btn">
            <input
              id="player-nickname-input"
              type="text"
              className="text-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex, Driver, Backseat"
              maxLength={24}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Save
            </button>
          </div>
        </form>

        {!trip.roomCode ? (
          <div className="share-enable-box">
            <div className="share-enable-icon">
              <Radio size={28} />
            </div>
            <h3>Turn this into a Shared Trip</h3>
            <p>
              Generate a live room code &amp; QR code so everyone in the car can spot plates from their own phone.
              Progress syncs automatically in real time — and merges cleanly if you lose signal!
            </p>
            <button
              type="button"
              id="enable-multiplayer-btn"
              className="btn btn-primary btn-full"
              onClick={onEnableMultiplayer}
            >
              <Radio size={17} /> Start Shared Session
            </button>
          </div>
        ) : (
          <div className="share-active-box">
            <div className={`sync-banner status-${syncStatus}`}>
              {syncStatus === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>
                {syncStatus === 'connected'
                  ? `Live sync active · ${onlinePeers.length + 1} ${onlinePeers.length === 0 ? 'phone' : 'phones'} connected`
                  : syncStatus === 'connecting' || syncStatus === 'reconnecting'
                    ? 'Connecting to live sync… changes still save offline'
                    : 'Offline mode · changes will sync once signal returns'}
              </span>
            </div>

            {visibleQrUrl && (
              <div className="qr-container">
                <img src={visibleQrUrl} alt={`QR code to join trip ${trip.name}`} className="qr-image" />
                <span className="qr-caption">Scan with another phone’s camera to join instantly</span>
              </div>
            )}

            <div className="room-code-card">
              <span className="room-code-label">Trip Join Code</span>
              <div className="room-code-row">
                <strong className="room-code-value">{trip.roomCode}</strong>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyCode}>
                  {copiedCode ? <Check size={15} /> : <Copy size={15} />}
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>

            <button type="button" id="share-trip-link-btn" className="btn btn-primary btn-full" onClick={handleShareLink}>
              {copiedLink ? <Check size={17} /> : <Share2 size={17} />}
              {copiedLink ? 'Invite Link Copied!' : 'Share Invite Link'}
            </button>

            <div className="crew-list">
              <span className="field-label">Connected Right Now</span>
              <div className="crew-pills">
                <span className="crew-pill is-me">
                  <span className="online-dot" />
                  {playerName || 'You'} (You)
                </span>
                {onlinePeers.map((peer) => (
                  <span key={peer.id} className="crew-pill">
                    <span className="online-dot" />
                    {peer.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
