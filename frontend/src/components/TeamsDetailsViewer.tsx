import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import './TeamsDetailsViewer.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    labels: string[];
    playerCounts: number[];
    averageAges: number[];
    averageSalaries: number[];
}

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                font: {
                    size: 14
                }
            }
        },
        title: {
            display: true,
            font: {
                size: 16
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

const TeamsDetailsViewer = () => {
    const [teams, setTeams] = useState<string[]>([]);
    const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);

    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            setTeamsLoading(true);
            setTeamsError(null);
            try {
                const res = await fetch("http://localhost:3001/api/teams/list");
                if (!res.ok) {
                    throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
                }
                const data = await res.json();
                setTeams(data);
            } catch (error) {
                console.error("Erreur lors du chargement des équipes:", error);
                setTeamsError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
            } finally {
                setTeamsLoading(false);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (!selectedTeam) {
            setChartData(null);
            return;
        }

        const fetchTeamDetails = async () => {
            setDetailsLoading(true);
            setDetailsError(null);
            setChartData(null);
            try {
                const res = await fetch(`http://localhost:3001/api/teams/details/${encodeURIComponent(selectedTeam)}`);
                if (!res.ok) {
                    throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
                }
                const data: TeamDetailsData = await res.json();
                setChartData(data);
            } catch (error) {
                console.error("Erreur lors du chargement des détails:", error);
                setDetailsError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
            } finally {
                setDetailsLoading(false);
            }
        };

        fetchTeamDetails();
    }, [selectedTeam]);

    if (teamsLoading) {
        return <div className="team-viewer-container"><p>Chargement de la liste des équipes...</p></div>;
    }

    if (teamsError) {
        return <div className="team-viewer-container error-message"><p>Erreur : {teamsError}</p></div>;
    }

    return (
        <div className="team-viewer-container">
            <h2>Sélectionner une équipe</h2>
            <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={teamsLoading}
            >
                <option value="">-- Choisissez une équipe --</option>
                {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                ))}
            </select>

            <div className="chart-section"></div>
                {selectedTeam && detailsLoading && (
                    <p>Chargement des données pour {selectedTeam}...</p>
                )}

                {selectedTeam && detailsError && (
                    <div className="error-message">
                        <p>Erreur lors du chargement des détails pour {selectedTeam}:</p>
                        <p>{detailsError}</p>
                    </div>
                )}

                {selectedTeam && !detailsLoading && !detailsError && chartData && (
                    <div className="flex">
                        <div className="chart-wrapper">
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            label: 'Nombre de joueurs',
                                            data: chartData.playerCounts,
                                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                            borderColor: 'rgba(54, 162, 235, 1)',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                        }
                                    ]
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins?.title,
                                            text: 'Nombre de joueurs'
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="chart-wrapper">
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            label: 'Âge moyen',
                                            data: chartData.averageAges,
                                            backgroundColor: 'rgba(0, 206, 86, 0.7)',
                                            borderColor: 'rgba(255, 206, 86, 1)',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                        }
                                    ]
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins?.title,
                                            text: 'Âge moyen'
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="chart-wrapper">
                            <Bar
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            label: 'Salaire moyen ($)',
                                            data: chartData.averageSalaries,
                                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                                            borderColor: 'rgba(75, 192, 192, 1)',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                        }
                                    ]
                                }}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins?.title,
                                            text: 'Salaire moyen ($)'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {!selectedTeam && (
                    <p>Veuillez sélectionner une équipe pour voir les détails.</p>
                )}
            </div>
    );
};

export default TeamsDetailsViewer;