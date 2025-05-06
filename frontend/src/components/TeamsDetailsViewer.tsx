import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ChartOptions, ChartEvent, ActiveElement
} from 'chart.js';
import { Player } from '../types';
import PlayerModal from './PlayerModal';
import { useTeams } from '../hooks/useTeams';
import { formatAvgAge, formatAvgSalary } from '../utils/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    teamName: string;
    labels: string[];
    playerCounts: number[];
    averageAges: (number | null)[];
    averageSalaries: (number | null)[];
    overallAverageAge: number | null;
    overallAverageSalary: number | null;
}

const baseChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { font: { size: 14 } } },
        title: { display: true, font: { size: 16 } },
        tooltip: {
             callbacks: {
                 label: function(context) {
                     let label = context.dataset.label || '';
                     if (label) label += ': ';
                     if (context.parsed.y !== null) {
                        if (context.dataset.label?.toLowerCase().includes('salaire')) {
                             label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(context.parsed.y);
                        } else {
                            label += context.parsed.y.toFixed(0);
                        }
                     }
                     return label;
                 }
             }
         }
    },
    scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Position' } }
    },
    elements: { bar: { borderRadius: 5 } }
};

interface ChartConfig {
    label: string;
    data: (number | null)[];
    backgroundColor: string;
    borderColor: string;
    title: string;
}

interface ChartBarProps {
    labels: string[];
    config: ChartConfig;
    onBarClick?: (label: string) => void;
}

const ChartBar = React.memo(({ labels, config, onBarClick }: ChartBarProps) => {
    const handleInternalChartClick = useCallback((event: ChartEvent, elements: ActiveElement[]) => {
        console.log(event);
        
        if (elements.length > 0 && onBarClick) {
            const { index } = elements[0];
            if (index >= 0 && index < labels.length) {
                const clickedLabel = labels[index];
                onBarClick(clickedLabel);
            }
        }
    }, [labels, onBarClick]);

    const chartOptions = useMemo(() => ({
        ...baseChartOptions,
        onClick: handleInternalChartClick,
        plugins: {
            ...baseChartOptions.plugins,
            title: { ...baseChartOptions.plugins?.title, text: config.title }
        }
    }), [config.title, handleInternalChartClick]);
    
    return (
        <div className="relative w-full min-h-[350px] h-[45vh] p-4 border border-gray-200 rounded-md bg-white shadow-sm">
            <Bar
                data={{ labels, datasets: [{ ...config, borderWidth: 1, borderRadius: 5 }] }}
                options={chartOptions}
            />
        </div>
    );
});
ChartBar.displayName = 'ChartBar';

const TeamsDetailsViewer = () => {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalData, setModalData] = useState<{
        position: string;
        players: Player[] | null;
        loading: boolean;
        error: string | null;
    }>({ position: '', players: null, loading: false, error: null })

    // Configuration des Chart Bars
    const playerCountConfig = {
        label: 'Nombre de joueurs',
        data: chartData?.playerCounts ?? [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        title: `Joueurs par Position (${chartData?.teamName})`,
    };
    const playerAgeConfig = {
        label: 'Âge moyen',
        data: chartData?.averageAges ?? [],
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgba(255, 159, 64, 1)',
        title: `Âge Moyen par Position (${chartData?.teamName})`,
    };
    const playerSalaryConfig = {
        label: 'Salaire moyen ($)',
        data: chartData?.averageSalaries ?? [],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        title: `Salaire Moyen par Position (${chartData?.teamName})`,
    };
    
    const { teams, loading: teamsLoading, error: teamsError } = useTeams();
    const isValidTeamDetailsData = (data: any): data is TeamDetailsData => {
        return data &&
            typeof data.teamName === 'string' &&
            Array.isArray(data.labels) &&
            Array.isArray(data.playerCounts) &&
            Array.isArray(data.averageAges) &&
            Array.isArray(data.averageSalaries) &&
            (typeof data.overallAverageAge === 'number' || data.overallAverageAge === null) &&
            (typeof data.overallAverageSalary === 'number' || data.overallAverageSalary === null);
    };
    
    useEffect(() => {
        setIsModalOpen(false);
        setModalData({ position: '', players: null, loading: false, error: null });

        if (!selectedTeam) {
            setChartData(null);
            return;
        }

        const fetchDetails = async () => {
            setDetailsLoading(true); setDetailsError(null); setChartData(null);
            try {
                 const res = await fetch(`http://localhost:3001/api/teams/details/${encodeURIComponent(selectedTeam)}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                    throw new Error(errorData.message || `Erreur HTTP ${res.status}`);
                }
                const data: TeamDetailsData = await res.json();
                 if (isValidTeamDetailsData(data) === false)
                 {
                     console.error("Format de données invalide reçu:", data);
                     throw new Error("Format de données invalide reçu pour les détails de l'équipe.");
                 }
                setChartData(data);
            } catch (error) {
                console.error(`Erreur chargement détails pour ${selectedTeam}:`, error);
                setDetailsError(error instanceof Error ? error.message : "Erreur inconnue.");
                setChartData(null);
            } finally {
                setDetailsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedTeam]);

    const handlePositionClick = useCallback(async (positionLabel: string) => {
        if (!selectedTeam) return;
        setIsModalOpen(true);
        setModalData({ position: positionLabel, players: null, loading: true, error: null });
        try {
            const apiUrl = `http://localhost:3001/api/players/filter?property=position&value=${encodeURIComponent(positionLabel)}&team=${encodeURIComponent(selectedTeam)}`;
            const res = await fetch(apiUrl);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                throw new Error(errorData.error || `Erreur lors de la récupération des joueurs (${res.status})`);
            }
            const players: Player[] = await res.json();
            if (!Array.isArray(players)) throw new Error("Format de réponse invalide pour la liste des joueurs.");
             setModalData({ position: positionLabel, players: players, loading: false, error: null });
        } catch (error) {
             console.error("Erreur chargement joueurs pour modal:", error);
             setModalData({ position: positionLabel, players: null, loading: false, error: error instanceof Error ? error.message : "Erreur inconnue." });
        }
    }, [selectedTeam]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    if (teamsLoading)
        return (
            <div className="p-5 rounded-lg shadow-md border border-gray-300 mb-5">
                <p className="text-center italic text-gray-600 py-10 px-5">
                    Chargement de la liste des équipes...
                </p>
            </div>
        );

    if (teamsError)
        return (
            <div className="p-5 rounded-lg shadow-md border border-gray-300 mb-5">
                 <div className="text-center p-5 my-5 mx-auto border border-red-400 bg-red-100 text-red-800 rounded max-w-xl">
                    <p>Erreur : {teamsError}</p>
                </div>
            </div>
        );

    return (
        <div className="p-5 font-sans rounded-lg shadow-md border border-gray-300 mb-5">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Analyse Détaillée par Équipe
            </h2>

            <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={teamsLoading || detailsLoading}
                aria-label="Sélectionner une équipe"
                className="block w-full max-w-md px-3 py-2.5 text-base border border-gray-400 rounded bg-white cursor-pointer mx-auto mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
                <option value="">-- Choisissez une équipe --</option>
                {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                ))}
            </select>

            <div className="mt-5">
                {selectedTeam && detailsLoading &&
                    <p className="text-center italic text-gray-600 py-10 px-5">
                        Chargement des données pour {selectedTeam}...
                    </p>
                }
                {selectedTeam && detailsError && (
                    <div className="text-center p-5 my-5 mx-auto border border-red-400 bg-red-100 text-red-800 rounded max-w-xl">
                        <p>Erreur lors du chargement des détails pour {selectedTeam} : {detailsError}</p>
                    </div>
                )}

                {selectedTeam && chartData && !detailsLoading && !detailsError && (
                     <>
                        <div className="mb-6 px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                            <h3 className="mt-0 mb-4 text-xl text-center text-gray-800 border-b border-gray-300 pb-2.5">
                                Résumé pour {chartData.teamName}
                            </h3>
                            <div className='flex flex-col items-stretch sm:flex-row sm:justify-around sm:items-center flex-wrap gap-5'>
                                <div className='flex flex-col items-center text-center min-w-[150px] p-2.5 border-b border-dashed border-gray-200 pb-4 last:border-b-0 last:pb-2.5 sm:border-b-0 sm:pb-2.5'>
                                    <span className='text-sm text-gray-600 mb-1 uppercase font-medium'>Âge Moyen (Équipe)</span>
                                    <span className='text-xl sm:text-2xl font-bold text-blue-700'>{formatAvgAge(chartData.overallAverageAge)}</span>
                                </div>
                                <div className='flex flex-col items-center text-center min-w-[150px] p-2.5 border-b border-dashed border-gray-200 pb-4 last:border-b-0 last:pb-2.5 sm:border-b-0 sm:pb-2.5'>
                                     <span className='text-sm text-gray-600 mb-1 uppercase font-medium'>Salaire Moyen (Équipe)</span>
                                     <span className='text-xl sm:text-2xl font-bold text-blue-700'>{formatAvgSalary(chartData.overallAverageSalary)}</span>
                                </div>
                            </div>
                        </div>

                        {chartData.labels.length === 0 ? (
                             <p className="text-center italic text-gray-600 py-10 px-5">
                                Aucune donnée de joueur par position trouvée pour {selectedTeam}.
                             </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mt-5">
                                <ChartBar
                                    labels={chartData.labels}
                                    config={playerCountConfig}
                                    onBarClick={handlePositionClick}
                                />
                                <ChartBar
                                    labels={chartData.labels}
                                    config={playerAgeConfig}
                                    onBarClick={handlePositionClick}
                                />
                                <ChartBar
                                    labels={chartData.labels}
                                    config={playerSalaryConfig}
                                    onBarClick={handlePositionClick}
                                />
                            </div>
                        )}
                    </>
                )}
                {!selectedTeam && !detailsLoading &&
                    <p className="text-center italic text-gray-600 py-10 px-5">
                        Veuillez sélectionner une équipe pour voir les détails.
                    </p>
                }
            </div>

            <PlayerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                positionLabel={modalData.position}
                players={modalData.players}
                loading={modalData.loading}
                error={modalData.error}
                teamName={selectedTeam}
            />
        </div>
    );
};

export default TeamsDetailsViewer;