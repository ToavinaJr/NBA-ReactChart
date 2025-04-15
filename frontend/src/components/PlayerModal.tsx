import React from 'react';
import { Player } from '../types';
import './PlayerModal.css'; // On ajoutera ce fichier CSS

interface PlayerModalProps {
    positionLabel: string;
    players: Player[];
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ positionLabel, players, loading, error, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Joueurs au poste : {positionLabel}</h2>
                {loading && <p>Chargement des joueurs...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                    <ul className="player-list">
                        {players.map(player => (
                            <li key={player.id || player.name}>{player.name} – {player.team} – {player.salary}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PlayerModal;
