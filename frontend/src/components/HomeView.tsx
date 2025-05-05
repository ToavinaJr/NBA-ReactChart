import React from 'react';
import { Player, PlayerSortKey, SortOrder } from '../types'; // Importer les types
import PlayerTable from './PlayerTable';
import { PaginationControls } from './PaginationControls';
import DataDescription from './DataDescription';

interface HomeViewProps {
    isLoading: boolean;
    error: string | null;
    players: Player[]; // Déjà paginés et filtrés
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    sortKey: PlayerSortKey | null;
    sortOrder: SortOrder;
    onSort: (key: PlayerSortKey) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    players,
    searchTerm,
    onSearchChange,
    currentPage,
    totalPages,
    onPageChange,
    
    sortKey,
    sortOrder,
    onSort,
}) => {

    return (
        <>
            <DataDescription />
            <input
                type="text"
                placeholder="Rechercher par nom, équipe, position, âge, numéro..."
                value={searchTerm}
                onChange={onSearchChange}
                className="px-3 py-2.5 mb-4 text-base border border-gray-300 rounded w-full box-border focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
            />
            {/* Passer les props de tri à PlayerTable */}
            <PlayerTable
                players={players}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={onSort}
             />
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </>
    );
};

export default HomeView;