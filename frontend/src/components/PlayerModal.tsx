import React from 'react';
import { Player } from '../types';
import './PlayerModal.css';

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
                    <table className="player-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Équipe</th>
                                <th>Salaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id || player.name}>
                                    <td>{player.name}</td>
                                    <td>{player.team}</td>
                                    <td>{player.salary}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PlayerModal;
