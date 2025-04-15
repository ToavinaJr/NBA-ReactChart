import React, { useEffect, useState, useCallback } from 'react'; // Ajout de useCallback
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
import { Player } from '../types'; // Assurez-vous que Player a bien un 'id' optionnel ou une clé unique

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TeamDetailsData {
    teamName: string; // Ajouté pour confirmation
    labels: string[]; // Ce sont les labels de position (PG, SG, etc.)
    playerCounts: number[];
    averageAges: (number | null)[]; // Peut être null si aucun joueur
    averageSalaries: (number | null)[]; // Peut être null si aucun joueur
}

// Options de base du graphique (inchangé)
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
         tooltip: { // Optionnel: améliorer le tooltip
             callbacks: {
                 label: function(context) {
                     let label = context.dataset.label || '';
                     if (label) {
                         label += ': ';
                     }
                     if (context.parsed.y !== null) {
                        // Formatage spécifique pour salaire
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
        // Optionnel: Ajouter un titre à l'axe X si ce sont des positions
        x: { title: { display: true, text: 'Position' } }
    },
};

interface ChartConfig {
    label: string;
    data: (number | null)[]; // Permettre null pour les moyennes
    backgroundColor: string;
    borderColor: string;
    title: string;
}

// ChartBar (inchangé, il fait déjà le travail)
interface ChartBarProps {
    labels: string[];
    config: ChartConfig;
    onBarClick?: (label: string) => void;
}

const ChartBar = React.memo(({ labels, config, onBarClick }: ChartBarProps) => { // Utilisation de React.memo pour optimisation
    const handleInternalChartClick = useCallback((event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0 && onBarClick) {
            const { index } = elements[0];
            if (index >= 0 && index < labels.length) {
                const clickedLabel = labels[index];
                console.log('[ChartBar] Click detected on label:', clickedLabel);
                onBarClick(clickedLabel);
            }
        }
    }, [labels, onBarClick]); // Dépendances de useCallback

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
                            borderRadius: 5, // Note: borderRadius est une option Chart.js v3+, pas un prop de dataset direct standard
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
                    // Appliquer borderRadius via les options si supporté
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
ChartBar.displayName = 'ChartBar'; // Aide au débogage avec React DevTools

// === Composant Principal TeamsDetailsViewer ===
const TeamsDetailsViewer = () => {
    // États pour la sélection de l'équipe et les données agrégées (inchangés)
    const [teams, setTeams] = useState<string[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [chartData, setChartData] = useState<TeamDetailsData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // === États pour la liste des joueurs filtrés par POSITION cliquée ===
    const [clickedPositionLabel, setClickedPositionLabel] = useState<string | null>(null); // Le label de la position cliquée (ex: 'PG')
    const [playersForPosition, setPlayersForPosition] = useState<Player[] | null>(null); // La liste des joueurs pour cette position
    const [playersLoading, setPlayersLoading] = useState<boolean>(false); // Chargement de cette liste spécifique
    const [playersError, setPlayersError] = useState<string | null>(null); // Erreur pour cette liste

    // Fetch la liste des équipes (inchangé)
    useEffect(() => {
        const fetchTeams = async () => {
            // ... (code inchangé)
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

    // Fetch les détails (agrégés) de l'équipe sélectionnée
    useEffect(() => {
        // --- Réinitialiser la liste des joueurs si l'équipe change ---
        setClickedPositionLabel(null);
        setPlayersForPosition(null);
        setPlayersError(null);
        setPlayersLoading(false);
        // --- Fin Réinitialisation ---

        if (!selectedTeam) {
            setChartData(null); // Efface les graphiques si aucune équipe n'est sélectionnée
            return;
        }

        const fetchDetails = async () => {
            setDetailsLoading(true);
            setDetailsError(null);
            setChartData(null); // Optionnel: effacer les anciennes données pendant le chargement
            try {
                const res = await fetch(`http://localhost:3001/api/teams/details/${encodeURIComponent(selectedTeam)}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                    throw new Error(errorData.message || `Erreur HTTP ${res.status}`);
                }
                const data: TeamDetailsData = await res.json();
                // Validation plus robuste
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

    // === Fonction pour fetch la liste des joueurs pour une POSITION cliquée ===
    const fetchPlayersForPosition = useCallback(async (positionLabel: string) => {
        if (!selectedTeam) return; // Sécurité

        console.log(`[FetchPlayers] Fetching players for team "${selectedTeam}" and position "${positionLabel}"`);
        setPlayersLoading(true);
        setPlayersError(null);
        setPlayersForPosition(null); // Vider la liste précédente
        setClickedPositionLabel(positionLabel); // Mémoriser la position cliquée

        try {
            // Utilisation de l'endpoint /api/players/filter existant
            const apiUrl = `http://localhost:3001/api/players/filter?property=position&value=${encodeURIComponent(positionLabel)}&team=${encodeURIComponent(selectedTeam)}`;
            console.log(`[FetchPlayers] Calling API: ${apiUrl}`);

            const res = await fetch(apiUrl);

            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({ error: `Erreur HTTP ${res.status}: ${res.statusText}` }));
                 // Utiliser 'error' si fourni par le backend, sinon message générique
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
    }, [selectedTeam]); // Dépendance: selectedTeam. useCallback évite de recréer la fonction à chaque rendu sauf si selectedTeam change.

    // === Gestionnaire de clic passé aux graphiques ===
    const handlePositionClick = useCallback((positionLabel: string) => {
        console.log(`[TeamsDetailsViewer] Position clicked: ${positionLabel}`);
        fetchPlayersForPosition(positionLabel);
    }, [fetchPlayersForPosition]); // Dépendance: la fonction fetch elle-même (qui dépend de selectedTeam)

    // Fonction pour effacer la liste des joueurs affichée (inchangée)
    const clearPlayerList = () => {
        setClickedPositionLabel(null);
        setPlayersForPosition(null);
        setPlayersError(null);
        setPlayersLoading(false);
    };

    // Rendu principal (inchangé jusqu'à la section des graphiques)
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

            {/* Section des graphiques */}
            <div className="chart-section">
                {/* Indicateur de chargement ou message d'erreur pour les détails de l'équipe */}
                {selectedTeam && detailsLoading && <p className="loading-message">Chargement des données pour {selectedTeam}...</p>}
                {selectedTeam && detailsError && (
                    <div className="error-message">
                        <p>Erreur lors du chargement des détails pour {selectedTeam} : {detailsError}</p>
                    </div>
                )}

                {/* Affichage des graphiques si les données sont chargées */}
                {selectedTeam && chartData && !detailsLoading && !detailsError && (
                     <>
                        {chartData.labels.length === 0 ? (
                             <p className="info-message">Aucune donnée de joueur trouvée pour {selectedTeam}.</p>
                        ) : (
                            <div className="charts-grid"> {/* Utiliser une grille pour l'alignement */}
                                <ChartBar
                                    labels={chartData.labels}
                                    config={{
                                        label: 'Nombre de joueurs',
                                        data: chartData.playerCounts,
                                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        title: 'Joueurs par Position',
                                    }}
                                    onBarClick={handlePositionClick} // <- Connecter le clic
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
                                    onBarClick={handlePositionClick} // <- Connecter le clic
                                />
                                <ChartBar
                                    labels={chartData.labels}
                                    config={{
                                        label: 'Salaire moyen ($)',
                                        data: chartData.averageSalaries,
                                        backgroundColor: 'rgba(75, 192, 192, 0.7)', // Vert/Cyan
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        title: 'Salaire moyen par Position',
                                    }}
                                    onBarClick={handlePositionClick} // <- Connecter le clic
                                />
                            </div>
                        )}
                    </>
                )}
                {!selectedTeam && !detailsLoading && <p className="info-message">Veuillez sélectionner une équipe pour voir les détails.</p>}
            </div>

            {/* === Section pour afficher la liste des joueurs par POSITION === */}
            {/* S'affiche seulement si une position a été cliquée */}
            {selectedTeam && clickedPositionLabel && (
                <div className="player-list-section">
                    {/* Titre dynamique */}
                    <h3>Joueurs de {selectedTeam} à la position : "{clickedPositionLabel}"</h3>

                    {/* Affichage conditionnel : chargement, erreur, ou liste */}
                    {playersLoading && <p className="loading-message">Chargement des joueurs...</p>}

                    {playersError && (
                        <div className="error-message error-message-list"> {/* Classes CSS pour style */}
                            <p>Erreur : {playersError}</p>
                        </div>
                    )}

                    {!playersLoading && !playersError && playersForPosition && (
                        <>
                            {playersForPosition.length > 0 ? (
                                <>
                                    <ul className="player-list">
                                        {playersForPosition.map((player, index) => (
                                            // Utiliser player.id si disponible et unique, sinon fallback
                                            <li key={player.id ?? `${player.name}-${index}`}>
                                                <span className="player-name">{player.name ?? 'N/A'}</span>
                                                {/* Afficher d'autres détails pertinents */}
                                                {player.age !== undefined && <span className="player-detail">Âge: {player.age}</span>}
                                                {player.height && <span className="player-detail">Taille: {player.height}</span>}
                                                {player.weight && <span className="player-detail">Poids: {player.weight}kg</span>}
                                                {player.salary !== undefined && player.salary !== null && ( // Vérifier aussi null
                                                    <span className="player-detail salary">
                                                        Salaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(player.salary)}
                                                    </span>
                                                 )}
                                                {player.college && <span className="player-detail college">Collège: {player.college}</span>}

                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={clearPlayerList} className="clear-button">Masquer la liste</button>
                                </>
                            ) : (
                                // Message si aucun joueur n'est trouvé pour cette position spécifique
                                <p className="no-players-message">Aucun joueur trouvé pour la position "{clickedPositionLabel}" dans l'équipe {selectedTeam}.</p>
                            )}
                             {/* Afficher le bouton Masquer même si aucun joueur n'est trouvé pour pouvoir fermer la section */}
                             {playersForPosition.length === 0 && (
                                 <button onClick={clearPlayerList} className="clear-button">Masquer</button>
                             )}
                        </>
                    )}
                     {/* Si pas en chargement, pas d'erreur, mais playersForPosition est null (ne devrait pas arriver sauf état initial) */}
                     {!playersLoading && !playersError && playersForPosition === null && (
                        <p className="info-message">Cliquez sur une barre de position dans les graphiques ci-dessus.</p>
                     )}
                </div>
            )}
            {/* === Fin Section Liste Joueurs === */}

        </div> // Fin team-viewer-container
    );
};

export default TeamsDetailsViewer;