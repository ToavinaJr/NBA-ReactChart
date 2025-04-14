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
    ChartEvent,
    ActiveElement,
} from 'chart.js';
import './TeamsDetailsViewer.css';
import { Player } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    labels: string[]; // Ces labels sont les catégories (ex: 'PG', 'SG', '20-24', '$1M-$5M')
    playerCounts: number[];
    averageAges: number[];
    averageSalaries: number[];
}

// Options de base du graphique (peuvent rester inchangées)
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
    // onClick sera ajouté dynamiquement dans ChartBar
};

interface ChartConfig {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    title: string;
}

// === Modification du composant ChartBar pour gérer le clic ===
interface ChartBarProps {
    labels: string[];
    config: ChartConfig;
    onBarClick?: (label: string) => void; // Prop pour remonter le label cliqué
}

const ChartBar = ({ labels, config, onBarClick }: ChartBarProps) => {

    // Gestionnaire de clic interne au graphique
    const handleInternalChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
        // S'assurer qu'un élément a été cliqué et qu'un gestionnaire onBarClick est fourni
        if (elements.length > 0 && onBarClick) {
            const { index } = elements[0]; // Récupérer l'index de la barre cliquée

            // Vérifier la validité de l'index et récupérer le label correspondant
            if (index >= 0 && index < labels.length) {
                const clickedLabel = labels[index];
                console.log('[ChartBar] Click detected on label:', clickedLabel);
                onBarClick(clickedLabel); // Appeler la fonction parent avec le label
            }
        }
    };

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
                    onClick: handleInternalChartClick, // <- Ajout du gestionnaire de clic ici
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
};
// === Fin Modification ChartBar ===


const TeamsDetailsViewer = () => {
    // États existants
    const [teams, setTeams] = useState<string[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // === Nouveaux états pour la liste des joueurs ===
    const [clickedCategoryLabel, setClickedCategoryLabel] = useState<string | null>(null);
    const [playersInCategory, setPlayersInCategory] = useState<Player[] | null>(null);
    const [playersLoading, setPlayersLoading] = useState<boolean>(false);
    const [playersError, setPlayersError] = useState<string | null>(null);
    // === Fin Nouveaux états ===

    // Fetch la liste des équipes (inchangé)
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

    // Fetch les détails (agrégés) de l'équipe sélectionnée
    useEffect(() => {
        // --- Réinitialiser la liste des joueurs si l'équipe change ---
        setClickedCategoryLabel(null);
        setPlayersInCategory(null);
        setPlayersError(null);
        setPlayersLoading(false);
        // --- Fin Réinitialisation ---

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
                const data = await res.json();
                 // Validation simple des données reçues
                 if (!data || !data.labels || !data.playerCounts || !data.averageAges || !data.averageSalaries) {
                     throw new Error("Format de données invalide reçu pour les détails de l'équipe.");
                 }
                setChartData(data);
            } catch (error) {
                console.error(`Erreur lors du chargement des détails pour ${selectedTeam}:`, error);
                setDetailsError(error instanceof Error ? error.message : "Erreur inconnue.");
                setChartData(null); // Nettoyer en cas d'erreur
            } finally {
                setDetailsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedTeam]); // Déclenché quand selectedTeam change

    // === Fonction pour fetch la liste des joueurs pour une catégorie cliquée ===
    const fetchPlayersForCategory = async (categoryLabel: string) => {
        if (!selectedTeam) return; // Ne rien faire si aucune équipe n'est sélectionnée

        console.log(`[FetchPlayers] Fetching players for team "${selectedTeam}" and category "${categoryLabel}"`);
        setPlayersLoading(true);
        setPlayersError(null);
        setPlayersInCategory(null); // Vider la liste précédente
        setClickedCategoryLabel(categoryLabel); // Mémoriser la catégorie cliquée

        try {
            // *** IMPORTANT: Adaptez l'URL à votre endpoint réel ***
            const apiUrl = `http://localhost:3001/api/teams/players?team=${encodeURIComponent(selectedTeam)}&categoryLabel=${encodeURIComponent(categoryLabel)}`;
            console.log(`[FetchPlayers] Calling API: ${apiUrl}`);

            const res = await fetch(apiUrl);

            if (!res.ok) {
                 // Essayer de lire un message d'erreur JSON du backend
                 const errorData = await res.json().catch(() => ({ message: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                 throw new Error(errorData.message || `Erreur lors de la récupération des joueurs (${res.status})`);
            }

            const players: Player[] = await res.json();
            console.log('[FetchPlayers] Players received:', players);

             // Vérifier si la réponse est bien un tableau
             if (!Array.isArray(players)) {
                throw new Error("Format de réponse invalide pour la liste des joueurs (attendu: tableau).");
            }

            setPlayersInCategory(players);

        } catch (error) {
            console.error("Erreur lors du chargement de la liste des joueurs:", error);
            setPlayersError(error instanceof Error ? error.message : "Erreur inconnue lors du chargement des joueurs.");
            setPlayersInCategory(null); // Assurer qu'aucune liste n'est affichée
        } finally {
            setPlayersLoading(false);
        }
    };
    // === Fin Fonction Fetch Joueurs ===

    // Fonction pour effacer la liste des joueurs affichée
    const clearPlayerList = () => {
        setClickedCategoryLabel(null);
        setPlayersInCategory(null);
        setPlayersError(null);
        setPlayersLoading(false);
    };


    // Rendu principal
    if (teamsLoading) return <div className="team-viewer-container"><p>Chargement de la liste des équipes...</p></div>;
    if (teamsError) return <div className="team-viewer-container error-message"><p>Erreur : {teamsError}</p></div>;

    return (
        <div className="team-viewer-container">
            <h2>Sélectionner une équipe</h2>
            <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={teamsLoading || detailsLoading} // Désactiver aussi pendant le chargement des détails
            >
                <option value="">-- Choisissez une équipe --</option>
                {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                ))}
            </select>

            {/* Section des graphiques */}
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
                                title: 'Nombre de joueurs (par catégorie)',
                            }}
                            
                        />
                        <ChartBar
                            labels={chartData.labels}
                            config={{
                                label: 'Âge moyen',
                                data: chartData.averageAges,
                                backgroundColor: 'rgba(255, 159, 64, 0.7)', // Couleur différente pour Âge
                                borderColor: 'rgba(255, 159, 64, 1)',
                                title: 'Âge moyen (par catégorie)',
                            }}
                            
                        />
                        <ChartBar
                            labels={chartData.labels}
                            config={{
                                label: 'Salaire moyen ($)',
                                data: chartData.averageSalaries,
                                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                title: 'Salaire moyen (par catégorie)',
                            }}
                            
                        />
                    </div>
                )}
                {!selectedTeam && !detailsLoading && <p>Veuillez sélectionner une équipe pour voir les détails.</p>}
            </div>

            {/* === Section pour afficher la liste des joueurs === */}
            {selectedTeam && clickedCategoryLabel && (
                <div className="player-list-section">
                    <h3>Joueurs pour la catégorie : "{clickedCategoryLabel}"</h3>

                    {/* Affichage conditionnel : chargement, erreur, ou liste */}
                    {playersLoading && <p className="loading-message">Chargement des joueurs...</p>}

                    {playersError && (
                        <div className="error-message-list">
                            <p>Erreur lors du chargement des joueurs :</p>
                            <p>{playersError}</p>
                        </div>
                    )}

                    {!playersLoading && !playersError && playersInCategory && (
                        <>
                            {playersInCategory.length > 0 ? (
                                <ul className="player-list">
                                    {playersInCategory.map((player) => (
                                        <li key={player.id}>
                                            <span className="player-name">{player.name}</span>
                                            {/* Afficher d'autres détails pertinents */}
                                            {player.position && <span className="player-detail">Pos: {player.position}</span>}
                                            {player.age !== undefined && <span className="player-detail">Âge: {player.age}</span>}
                                            {player.salary !== undefined && (
                                                <span className="player-detail">
                                                    Salaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(player.salary)}
                                                </span>
                                             )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-players-message">Aucun joueur trouvé pour cette catégorie.</p>
                            )}
                            <button onClick={clearPlayerList} className="clear-button">Masquer la liste</button>
                        </>
                    )}
                </div>
            )}
             {/* === Fin Section Liste Joueurs === */}

        </div> // Fin team-viewer-container
    );
};

export default TeamsDetailsViewer;