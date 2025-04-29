import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartEvent,
    ActiveElement,
} from 'chart.js';
import './TeamsDetailsViewer.css';
import { Player } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    teamName: string;
    labels: string[];
    playerCounts: number[];
    averageAges: (number | null)[];
    averageSalaries: (number | null)[];
}

const baseChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { font: { size: 14 } },
        },
        title: {
            display: true,
            font: { size: 16 },
        },
         tooltip: {
             callbacks: {
                 label: function(context) {
                     let label = context.dataset.label || '';
                     if (label) {
                         label += ': ';
                     }
                     if (context.parsed.y !== null) {
                        if (context.dataset.label?.toLowerCase().includes('salaire')) {
                             label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(context.parsed.y);
                        } else {
                             label += context.parsed.y;
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
        if (elements.length > 0 && onBarClick) {
            const { index } = elements[0];
            if (index >= 0 && index < labels.length) {
                const clickedLabel = labels[index];
                console.log('[ChartBar] Click detected on label:', clickedLabel);
                onBarClick(clickedLabel);
            }
        }
    }, [labels, onBarClick]);

    return (
        <div className="chart-wrapper">
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: config.label,
                            data: config.data,
                            backgroundColor: config.backgroundColor,
                            borderColor: config.borderColor,
                            borderWidth: 1,
                            borderRadius: 5,
                        },
                    ],
                }}
                options={{
                    ...baseChartOptions,
                    onClick: handleInternalChartClick,
                    plugins: {
                        ...baseChartOptions.plugins,
                        title: {
                            ...baseChartOptions.plugins?.title,
                            text: config.title,
                        },
                    },
                    elements: {
                        bar: {
                            borderRadius: 5,
                        }
                    }
                }}
            />
        </div>
    );
});

ChartBar.displayName = 'ChartBar'; 

const TeamsDetailsViewer = () => {
    const [teams, setTeams] = useState<string[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const [clickedPositionLabel, setClickedPositionLabel] = useState<string | null>(null);
    const [playersForPosition, setPlayersForPosition] = useState<Player[] | null>(null);
    const [playersLoading, setPlayersLoading] = useState<boolean>(false);
    const [playersError, setPlayersError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
             setTeamsLoading(true);
             setTeamsError(null);
             try {
                 const res = await fetch("http://localhost:3001/api/teams/list");
                 if (!res.ok) throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
                 const teamList = await res.json();
                 if (!Array.isArray(teamList)) throw new Error("Format de réponse invalide pour la liste des équipes.");
                 setTeams(teamList);
             } catch (error) {
                 console.error("Erreur lors du chargement des équipes:", error);
                 setTeamsError(error instanceof Error ? error.message : "Erreur inconnue.");
             } finally {
                 setTeamsLoading(false);
             }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        setClickedPositionLabel(null);
        setPlayersForPosition(null);
        setPlayersError(null);
        setPlayersLoading(false);

        if (!selectedTeam) {
            setChartData(null);
            return;
        }

        const fetchDetails = async () => {
            setDetailsLoading(true);
            setDetailsError(null);
            setChartData(null);
            try {
                const res = await fetch(`http://localhost:3001/api/teams/details/${encodeURIComponent(selectedTeam)}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                    throw new Error(errorData.message || `Erreur HTTP ${res.status}`);
                }
                const data: TeamDetailsData = await res.json();
                 if (!data || !data.labels || !Array.isArray(data.labels) ||
                     !data.playerCounts || !Array.isArray(data.playerCounts) ||
                     !data.averageAges || !Array.isArray(data.averageAges) ||
                     !data.averageSalaries || !Array.isArray(data.averageSalaries)) {
                     throw new Error("Format de données invalide reçu pour les détails de l'équipe.");
                 }
                setChartData(data);
            } catch (error) {
                console.error(`Erreur lors du chargement des détails pour ${selectedTeam}:`, error);
                setDetailsError(error instanceof Error ? error.message : "Erreur inconnue.");
                setChartData(null);
            } finally {
                setDetailsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedTeam]);

    const fetchPlayersForPosition = useCallback(async (positionLabel: string) => {
        if (!selectedTeam) return;

        console.log(`[FetchPlayers] Fetching players for team "${selectedTeam}" and position "${positionLabel}"`);
        setPlayersLoading(true);
        setPlayersError(null);
        setPlayersForPosition(null);
        setClickedPositionLabel(positionLabel);

        try {
            const apiUrl = `http://localhost:3001/api/players/filter?property=position&value=${encodeURIComponent(positionLabel)}&team=${encodeURIComponent(selectedTeam)}`;
            console.log(`[FetchPlayers] Calling API: ${apiUrl}`);

            const res = await fetch(apiUrl);

            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({ error: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                 throw new Error(errorData.error || `Erreur lors de la récupération des joueurs (${res.status})`);
            }

            const players: Player[] = await res.json();
            console.log('[FetchPlayers] Players received:', players);

             if (!Array.isArray(players)) {
                throw new Error("Format de réponse invalide pour la liste des joueurs (attendu: tableau).");
            }

            setPlayersForPosition(players);

        } catch (error) {
            console.error("Erreur lors du chargement de la liste des joueurs:", error);
            setPlayersError(error instanceof Error ? error.message : "Erreur inconnue lors du chargement des joueurs.");
            setPlayersForPosition(null);
        } finally {
            setPlayersLoading(false);
        }
    }, [selectedTeam]);

    const handlePositionClick = useCallback((positionLabel: string) => {
        console.log(`[TeamsDetailsViewer] Position clicked: ${positionLabel}`);
        fetchPlayersForPosition(positionLabel);
    }, [fetchPlayersForPosition]);

    const clearPlayerList = () => {
        setClickedPositionLabel(null);
        setPlayersForPosition(null);
        setPlayersError(null);
        setPlayersLoading(false);
    };

    if (teamsLoading) return <div className="team-viewer-container"><p>Chargement de la liste des équipes...</p></div>;
    if (teamsError) return <div className="team-viewer-container error-message"><p>Erreur : {teamsError}</p></div>;

    return (
        <div className="team-viewer-container">
            <h2>Analyse par Équipe</h2>
            <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={teamsLoading || detailsLoading}
                aria-label="Sélectionner une équipe"
            >
                <option value="">-- Choisissez une équipe --</option>
                {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                ))}
            </select>

            <div className="chart-section">
                {selectedTeam && detailsLoading && <p className="loading-message">Chargement des données pour {selectedTeam}...</p>}
                {selectedTeam && detailsError && (
                    <div className="error-message">
                        <p>Erreur lors du chargement des détails pour {selectedTeam} : {detailsError}</p>
                    </div>
                )}

                {selectedTeam && chartData && !detailsLoading && !detailsError && (
                     <>
                        {chartData.labels.length === 0 ? (
                             <p className="info-message">Aucune donnée de joueur trouvée pour {selectedTeam}.</p>
                        ) : (
                            <div className="charts-grid">
                                <ChartBar
                                    labels={chartData.labels}
                                    config={{
                                        label: 'Nombre de joueurs',
                                        data: chartData.playerCounts,
                                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        title: 'Joueurs par Position',
                                    }}
                                    onBarClick={handlePositionClick}
                                />
                                <ChartBar
                                    labels={chartData.labels}
                                    config={{
                                        label: 'Âge moyen',
                                        data: chartData.averageAges,
                                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                                        borderColor: 'rgba(255, 159, 64, 1)',
                                        title: 'Âge moyen par Position',
                                    }}
                                    onBarClick={handlePositionClick}
                                />
                                <ChartBar
                                    labels={chartData.labels}
                                    config={{
                                        label: 'Salaire moyen ($)',
                                        data: chartData.averageSalaries,
                                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        title: 'Salaire moyen par Position',
                                    }}
                                    onBarClick={handlePositionClick}
                                />
                            </div>
                        )}
                    </>
                )}
                {!selectedTeam && !detailsLoading && <p className="info-message">Veuillez sélectionner une équipe pour voir les détails.</p>}
            </div>

            {selectedTeam && clickedPositionLabel && (
                <div className="player-list-section">
                    <h3>Joueurs de {selectedTeam} à la position : "{clickedPositionLabel}"</h3>

                    {playersLoading && <p className="loading-message">Chargement des joueurs...</p>}

                    {playersError && (
                        <div className="error-message error-message-list">
                            <p>Erreur : {playersError}</p>
                        </div>
                    )}

                    {!playersLoading && !playersError && playersForPosition && (
                        <>
                            {playersForPosition.length > 0 ? (
                                <div className='table-container'>
                                    <table className="player-table">
    <thead>
        <tr>
            <th>Nom</th>
            <th>Âge</th>
            <th>Taille</th>
            <th>Poids</th>
            <th>Salaire</th>
            <th>Collège</th>
        </tr>
    </thead>
    <tbody>
        {playersForPosition.map((player, index) => (
            <tr key={player.id ?? `${player.name}-${index}`}>
                <td className="player-name">{player.name ?? 'N/A'}</td>
                <td>{player.age ?? '–'}</td>
                <td>{player.height ?? '–'}</td>
                <td>{player.weight ? `${player.weight} kg` : '–'}</td>
                <td>
                    {player.salary !== undefined && player.salary !== null
                        ? new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(player.salary)
                        : '–'}
                </td>
                <td>{player.college ?? '–'}</td>
            </tr>
        ))}
    </tbody>
</table>

                                    <button onClick={clearPlayerList} className="clear-button">Masquer la liste</button>
                                </div>
                            ) : (
                                <p className="no-players-message">Aucun joueur trouvé pour la position "{clickedPositionLabel}" dans l'équipe {selectedTeam}.</p>
                            )}
                             {playersForPosition.length === 0 && (
                                 <button onClick={clearPlayerList} className="clear-button">Masquer</button>
                             )}
                        </>
                    )}
                     {!playersLoading && !playersError && playersForPosition === null && (
                        <p className="info-message">Cliquez sur une barre de position dans les graphiques ci-dessus.</p>
                     )}
                </div>
            )}

        </div>
    );
};

export default TeamsDetailsViewer;