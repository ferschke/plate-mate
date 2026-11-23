import React, { useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';

interface NicknamePromptModalProps {
  tripName: string;
  roomCode: string;
  onConfirm: (nickname: string) => void;
  onCancel: () => void;
}

export const NicknamePromptModal: React.FC<NicknamePromptModalProps> = ({
  tripName,
  roomCode,
  onConfirm,
  onCancel,
}) => {
  const [nickname, setNickname] = useState('');

  const trimmed = nickname.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nickname-prompt-title"
    >
      <div className="modal-sheet">
        <div className="nickname-prompt-header">
          <div className="share-enable-icon">
            <Users size={26} />
          </div>
          <h2 id="nickname-prompt-title">Join “{tripName}”</h2>
          <p className="nickname-prompt-sub">
            Pick a nickname so everyone in the car knows who spotted each plate. You can change it anytime later.
          </p>
          <span className="shared-tag">Room Code: {roomCode}</span>
        </div>

        <form className="nickname-prompt-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="join-welcome-nickname" className="field-label">
              Your Nickname
            </label>
            <input
              id="join-welcome-nickname"
              type="text"
              className="text-input"
              placeholder="e.g. Alex, Co-Pilot, Backseat"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            id="confirm-welcome-nickname-btn"
            className="btn btn-primary btn-full"
            disabled={!trimmed}
          >
            Join Trip <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-full"
            onClick={onCancel}
          >
            Not now
          </button>
        </form>
      </div>
    </div>
  );
};
