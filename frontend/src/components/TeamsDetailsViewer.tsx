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
    ChartOptions,
} from 'chart.js';
import './TeamsDetailsViewer.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    labels: string[];
    playerCounts: number[];
    averageAges: number[];
    averageSalaries: number[];
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
    },
    scales: {
        y: { beginAtZero: true },
    },
};

interface ChartConfig {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    title: string;
}

const ChartBar = ({ labels, config }: { labels: string[]; config: ChartConfig }) => (
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
                plugins: {
                    ...baseChartOptions.plugins,
                    title: {
                        ...baseChartOptions.plugins?.title,
                        text: config.title,
                    },
                },
            }}
        />
    </div>
);

const TeamsDetailsViewer = () => {
    const [teams, setTeams] = useState<string[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);

    const [selectedTeam, setSelectedTeam] = useState('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            setTeamsLoading(true);
            setTeamsError(null);
            try {
                const res = await fetch("http://localhost:3001/api/teams/list");
                if (!res.ok) throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
                setTeams(await res.json());
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
        if (!selectedTeam) {
            setChartData(null);
            return;
        }

        const fetchDetails = async () => {
            setDetailsLoading(true);
            setDetailsError(null);
            try {
                const res = await fetch(`http://localhost:3001/api/teams/details/${encodeURIComponent(selectedTeam)}`);
                if (!res.ok) throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
                setChartData(await res.json());
            } catch (error) {
                console.error("Erreur lors du chargement des détails:", error);
                setDetailsError(error instanceof Error ? error.message : "Erreur inconnue.");
            } finally {
                setDetailsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedTeam]);

    if (teamsLoading) return <div className="team-viewer-container"><p>Chargement de la liste des équipes...</p></div>;

    if (teamsError) return <div className="team-viewer-container error-message"><p>Erreur : {teamsError}</p></div>;

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

            <div className="chart-section">
                {selectedTeam && detailsLoading && <p>Chargement des données pour {selectedTeam}...</p>}

                {selectedTeam && detailsError && (
                    <div className="error-message">
                        <p>Erreur lors du chargement des détails pour {selectedTeam} :</p>
                        <p>{detailsError}</p>
                    </div>
                )}

                {selectedTeam && chartData && !detailsLoading && !detailsError && (
                    <div className="flex">
                        <ChartBar
                            labels={chartData.labels}
                            config={{
                                label: 'Nombre de joueurs',
                                data: chartData.playerCounts,
                                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                title: 'Nombre de joueurs',
                            }}
                        />
                        <ChartBar
                            labels={chartData.labels}
                            config={{
                                label: 'Âge moyen',
                                data: chartData.averageAges,
                                backgroundColor: 'rgba(0, 206, 86, 0.7)',
                                borderColor: 'rgba(255, 206, 86, 1)',
                                title: 'Âge moyen',
                            }}
                        />
                        <ChartBar
                            labels={chartData.labels}
                            config={{
                                label: 'Salaire moyen ($)',
                                data: chartData.averageSalaries,
                                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                title: 'Salaire moyen ($)',
                            }}
                        />
                    </div>
                )}

                {!selectedTeam && <p>Veuillez sélectionner une équipe pour voir les détails.</p>}
            </div>
        </div>
    );
};

export default TeamsDetailsViewer;
