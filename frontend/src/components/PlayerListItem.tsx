import React from 'react';
import { Player } from '../types';

interface PlayerListItemProps {
    player: Player;
}

const PlayerListItem: React.FC<PlayerListItemProps> = ({ player }) => {
    const formatSalary = (salary: number | undefined | null): string => {
        if (salary === null || salary === undefined) return '';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(salary);
    };

    return (
        <li className="py-3 px-2 border-b border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-sm items-center last:border-b-0 hover:bg-gray-50">
            <strong className="min-w-[150px] basis-[150px] text-gray-800">{player.name ?? 'N/A'}</strong>
            <span className="text-gray-600">{player.team ?? 'N/A'}</span>
            <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{player.position ?? '?'}</span>
            <span className="text-gray-500">(#{player.number ?? '?'})</span>
            <span className="ml-auto text-gray-700">Age: {player.age ?? '?'}</span>
            {player.height && <span className="text-gray-600">Ht: {player.height}</span>}
            {player.weight && <span className="text-gray-600">Wt: {player.weight}kg</span>}
            {player.college && <span className="text-xs text-gray-500 basis-full text-left">Collège: {player.college}</span>}
            {player.salary !== null && player.salary !== undefined && (
                <span className="font-bold text-blue-600 basis-full text-right">
                    Salaire: {formatSalary(player.salary)}
                </span>
            )}
        </li>
    );
};

export default PlayerListItem;