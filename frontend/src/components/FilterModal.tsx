import React from 'react';
import { Player } from '../types';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import PlayerListItem from './PlayerListItem';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filterInfo: { property: string; label: string | number } | null;
    isFiltering: boolean;
    filterError: string | null;
    filteredPlayers: Player[] | null;
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    filterInfo,
    isFiltering,
    filterError,
    filteredPlayers,
    searchTerm,
    onSearchChange,
}) => {
    if (!isOpen) return null;

    const playersToDisplay = filteredPlayers
        ? filteredPlayers.filter(player => {
            const term = searchTerm.trim().toLowerCase();
            if (!term) return true;
            return (
                player.name?.toLowerCase().includes(term) ||
                player.team?.toLowerCase().includes(term) ||
                String(player.number).toLowerCase().includes(term) ||
                player.position?.toLowerCase().includes(term) ||
                player.college?.toLowerCase().includes(term)
            );
        })
        : [];

    const getFilterLabel = (): string => {
        if (!filterInfo) return "Filtre";
        const { property, label } = filterInfo;
        return `Joueurs - ${property}: "${String(label)}"`;
    };

    const getNoPlayersInitialMessage = (): string => {
        if (!filterInfo) return "Aucun joueur trouvé.";
        return `Aucun joueur trouvé pour ${filterInfo.property === 'Salary' ? 'cette tranche de salaire' : `la catégorie "${String(filterInfo.label)}"`}.`;
    }

    const getNoPlayersFoundMessage = (): string => {
         return `Aucun joueur ne correspond à votre recherche "${searchTerm}" dans cette sélection.`
    }

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/70 z-[999]"
                aria-hidden="true"
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl max-h-[85vh] bg-white p-5 rounded-lg shadow-xl z-[1000] flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800 m-0">
                        {filterInfo ? getFilterLabel() : 'Chargement...'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-transparent border-none text-3xl cursor-pointer text-gray-500 hover:text-gray-800 leading-none p-0 focus:outline-none"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Filtrer dans cette sélection..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="px-3 py-2.5 mb-4 text-base border border-gray-300 rounded w-full box-border flex-shrink-0 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none disabled:bg-gray-100"
                    disabled={isFiltering || !!filterError}
                />

                <div className="overflow-y-auto flex-grow min-h-[100px]">
                    {isFiltering && <LoadingIndicator message="Chargement des joueurs..." />}
                    <ErrorMessage title="Erreur de filtrage" message={filterError} className="text-red-800 text-center p-5 border border-red-300 rounded bg-red-100" />

                    {!isFiltering && !filterError && (
                        <>
                            {filteredPlayers && filteredPlayers.length === 0 && (
                                <p className="text-center py-8 text-gray-500">
                                    {getNoPlayersInitialMessage()}
                                </p>
                            )}
                            {filteredPlayers && filteredPlayers.length > 0 && playersToDisplay.length === 0 && (
                                <p className="text-center py-8 italic text-gray-700">
                                    {getNoPlayersFoundMessage()}
                                </p>
                            )}
                            {playersToDisplay.length > 0 && (
                                <ul className="list-none p-0 m-0">
                                    {playersToDisplay.map((player, index) => (
                                        <PlayerListItem key={player.id || `${player.name}-${index}`} player={player} />
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default FilterModal;