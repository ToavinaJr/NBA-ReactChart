import React, { useEffect, useCallback } from 'react';
import { Player } from '../types';

interface PlayerModalProps {
    isOpen: boolean;
    positionLabel: string;
    players: Player[] | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    teamName?: string;
}

const PlayerModal: React.FC<PlayerModalProps> = ({
    isOpen,
    positionLabel,
    players,
    loading,
    error,
    onClose,
    teamName
}) => {
    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, handleEscapeKey]);

    if (!isOpen) return null;

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const formatSalary = (salary: number | null | undefined): string => {
        if (salary === null || salary === undefined) return '–';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(salary);
    };

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-5"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white px-8 py-6 rounded-lg shadow-lg relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto"
                onClick={handleContentClick}
            >
                <button
                    className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                    aria-label="Fermer la fenêtre modale"
                >
                    ×
                </button>

                <h2
                    id="modal-title"
                    className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2"
                >
                    {teamName ? `${teamName} - ` : ''}Joueurs au poste : {positionLabel}
                </h2>

                <div className="flex-grow overflow-y-auto">
                    {loading && (
                        <p className="text-center p-5 italic text-gray-600">
                            Chargement des joueurs...
                        </p>
                    )}

                    {error && (
                        <p className="text-center p-5 italic text-red-600 font-bold">
                            Erreur : {error}
                        </p>
                    )}

                    {!loading && !error && players && (
                        players.length > 0 ? (
                            <div className="border border-gray-300 rounded mt-4 overflow-auto max-h-[60vh]">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Nom</th>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Âge</th>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Taille</th>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Poids</th>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Salaire</th>
                                            <th scope="col" className="border border-gray-300 py-2.5 px-3 text-left font-semibold">Collège</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player, index) => (
                                            <tr
                                                key={player.id ?? `${player.name}-${index}`}
                                                className="even:bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                                            >
                                                <td className="border border-gray-300 py-2.5 px-3 font-medium">{player.name ?? 'N/A'}</td>
                                                <td className="border border-gray-300 py-2.5 px-3">{player.age ?? '–'}</td>
                                                <td className="border border-gray-300 py-2.5 px-3">{player.height ?? '–'}</td>
                                                <td className="border border-gray-300 py-2.5 px-3">{player.weight ? `${player.weight} kg` : '–'}</td>
                                                <td className="border border-gray-300 py-2.5 px-3">{formatSalary(player.salary)}</td>
                                                <td className="border border-gray-300 py-2.5 px-3">{player.college ?? '–'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center p-5 italic text-gray-600">
                                Aucun joueur trouvé pour cette position.
                            </p>
                        )
                    )}

                    {!loading && !error && !players && (
                        <p className="text-center p-5 italic text-gray-600">
                            Aucune donnée de joueur à afficher.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerModal;
