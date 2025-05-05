import React from 'react';
import { Player, PlayerSortKey, SortOrder } from '../types';

interface PlayerTableProps {
    players: Player[];
    sortKey: PlayerSortKey | null;
    sortOrder: SortOrder;
    onSort: (key: PlayerSortKey) => void;
}

const SortIndicator: React.FC<{ order: SortOrder | null }> = ({ order }) => {
    if (!order) return <span className="text-gray-400 ml-1">↕</span>;
    return <span className="ml-1">{order === 'asc' ? '▲' : '▼'}</span>;
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: PlayerSortKey;
    currentSortKey: PlayerSortKey | null;
    currentSortOrder: SortOrder;
    onSort: (key: PlayerSortKey) => void;
    className?: string;
}> = ({ label, sortKey, currentSortKey, currentSortOrder, onSort, className = "" }) => {
    const isCurrentSortKey = currentSortKey === sortKey;
    const sortOrderToShow = isCurrentSortKey ? currentSortOrder : null;


    const headerClasses = `p-2.5 text-left text-sm font-semibold text-gray-700 bg-gray-100 border-b border-gray-300 cursor-pointer hover:bg-gray-200 sticky top-0 z-10 ${className}`;

    return (
        <th
            className={headerClasses}
            onClick={() => onSort(sortKey)}
            aria-sort={isCurrentSortKey ? (currentSortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            {label}
            <SortIndicator order={sortOrderToShow} />
        </th>
    );
};


const PlayerTable: React.FC<PlayerTableProps> = ({ players, sortKey, sortOrder, onSort }) => {

    const formatSalary = (salary: number | undefined | null): string => {
        if (salary === null || salary === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(salary);
    };

    return (
        <div className="overflow-x-auto shadow border-b border-gray-200 rounded-lg mb-4">
            {/* Ajout de table-fixed pour forcer les largeurs définies */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Application des largeurs via la prop className */}
                        <SortableHeader label="Name" sortKey="name" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-52" />
                        <SortableHeader label="Team" sortKey="team" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-40" />
                        <SortableHeader label="#" sortKey="number" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-12 text-center" />
                        <SortableHeader label="Pos" sortKey="position" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-12 text-center" />
                        <SortableHeader label="Age" sortKey="age" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-12 text-right" />
                        <SortableHeader label="Height" sortKey="height" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-16 text-center" />
                        <SortableHeader label="Weight (kg)" sortKey="weight" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-20 text-right" />
                        <SortableHeader label="College" sortKey="college" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-52" />
                        <SortableHeader label="Salary" sortKey="salary" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="w-28 text-right" />
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {players.length === 0 ? (
                        <tr>
                            {/* Ajustement de colSpan au nombre réel de colonnes */}
                            <td colSpan={9} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center italic">
                                Aucun joueur à afficher.
                            </td>
                        </tr>
                    ) : (
                        players.map((player, index) => (
                            <tr key={player.id || `${player.name}-${index}`} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate">{player.name ?? 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 truncate">{player.team ?? 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{player.number ?? '?'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{player.position ?? '?'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{player.age ?? '?'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{player.height ?? 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{player.weight ?? '?'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 truncate">{player.college ?? 'N/A'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-600 font-semibold text-right">{formatSalary(player.salary)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerTable;