// import React, { useState, useEffect, useRef } from 'react';
// import {
//     Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
//     DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
//     ChartEvent, ActiveElement
// } from 'chart.js';
// import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
// import { Player, ChartResponseData, ChartStateData } from '../types'; // Assurez-vous que ce chemin est correct
// import { generateColors } from '../utils/index.d.ts'; // Assurez-vous que ce chemin est correct
// import ChartFilterSidebar from './ChartFilterSidebar.tsx'; // Assurez-vous que ce chemin est correct

// // Enregistrement des composants ChartJS (inchangé)
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

// const PlayerChart: React.FC = () => {
//   // --- États (inchangés) ---
//   const [chartData, setChartData] = useState<ChartStateData | null>(null);
//   const [selectedTarget, setSelectedTarget] = useState<string>('Age');
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
//   const [isFiltering, setIsFiltering] = useState<boolean>(false);
//   const [filterError, setFilterError] = useState<string | null>(null);
//   const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

//   // --- Effet pour charger les données du GRAPHIQUE ---
//   useEffect(() => {
//     const fetchChartData = async () => {
//       setIsLoading(true);
//       setError(null);
//       // setChartData(null); // Optionnel : Remettre à null peut causer un flash, mais assure un état propre. A tester.
//       // Réinitialiser le filtre et le modal (inchangé)
//       setFilteredPlayers(null);
//       setCurrentFilterInfo(null);
//       setFilterError(null);
//       setIsModalOpen(false);
//       setSearchTerm('');

//       const targetParam = selectedTarget.toLowerCase();
//       console.log(`[EFFECT] Fetching chart data for: ${targetParam}`); // Log début fetch

//       try {
//         const response = await fetch(`http://localhost:3001/api/players/stats/${targetParam}`);
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
//           throw new Error(errorData.error || `HTTP error ${response.status}`);
//         }
//         const data: ChartResponseData = await response.json();
//         console.log(`[EFFECT] Received data for ${targetParam}:`, data); // Log données reçues

//         // Vérification des données reçues (inchangée)
//         if (!data || !data.labels || !data.data || !Array.isArray(data.labels) || !Array.isArray(data.data)) {
//           console.warn(`[EFFECT] Données agrégées invalides ou mal formatées reçues pour ${targetParam}`, data);
//           setError(`Format de données invalide reçu du serveur pour ${selectedTarget}.`);
//           setChartData(null); // Assurer que chartData est null si données invalides
//           setIsLoading(false);
//           return;
//         }
        
//         // Si labels est vide, afficher un message clair plutôt qu'un graphique vide/buggé
//          if (data.labels.length === 0) {
//           console.warn(`[EFFECT] Aucune donnée agrégée trouvée pour ${targetParam}`);
//            setChartData({
//              labels: [],
//              datasets: [{
//                label: `Aucune donnée pour ${selectedTarget}`, // Label informatif
//                data: [],
//                backgroundColor: [],
//                borderColor: [],
//                borderWidth: 1,
//              }]
//            });
//            setIsLoading(false);
//            return;
//          }

//         const numLabels = data.labels.length;
//         const backgroundColors = generateColors(numLabels);
//         const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

//         // --- Génération du Label ---
//         // La logique ici est correcte. Si 'selectedTarget' est 'Position', ça devrait produire 'Nombre de Joueurs par Position'.
//         const chartLabel = `Nombre de Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`;
//         // **** LOG CRUCIAL 1 ****
//         console.log(`[EFFECT] Generated chartLabel for ${selectedTarget}: "${chartLabel}"`);

//         // Structure de données pour le state
//         const newChartData = {
//           labels: data.labels,
//           datasets: [{
//             label: chartLabel, // Utilisation du label généré
//             data: data.data,
//             backgroundColor: backgroundColors,
//             borderColor: borderColors,
//             borderWidth: 1,
//           }],
//         };

//         // **** LOG CRUCIAL 2 ****
//         console.log(`[EFFECT] Setting chartData state for ${selectedTarget} with:`, JSON.stringify(newChartData, null, 2));
//         setChartData(newChartData);

//       } catch (err) {
//         console.error(`[EFFECT] Erreur fetchChartData pour ${targetParam}:`, err);
//         setError(err instanceof Error ? err.message : 'Erreur inconnue');
//         setChartData(null); // Nettoyer en cas d'erreur
//       } finally {
//         setIsLoading(false);
//          console.log(`[EFFECT] Finished fetch for ${targetParam}. isLoading: false`);
//       }
//     };

//     fetchChartData();
//   }, [selectedTarget]); // Dépendance correcte

//   // --- Fonction de CLIC sur le graphique (inchangée) ---
//   const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
//     if (elements.length === 0 || !chartData || !chartData.labels || chartData.labels.length === 0) return;

//     const { index } = elements[0];
//     // Vérifier que l'index est valide
//     if (index < 0 || index >= chartData.labels.length) {
//         console.warn("Index de clic invalide:", index);
//         return;
//     }
//     const clickedLabel = chartData.labels[index];
//     const filterProperty = selectedTarget; // Utilise le target ACTUELLEMENT affiché

//     console.log(`[CLICK] Clic détecté: Propriété='${filterProperty}', Label/Tranche='${clickedLabel}' (Index: ${index})`);

//     const valueToSend = clickedLabel;

//     // Réinitialiser l'état du modal (inchangé)
//     setIsFiltering(true);
//     setFilterError(null);
//     setFilteredPlayers(null);
//     setSearchTerm('');
//     setCurrentFilterInfo({ property: filterProperty, label: clickedLabel });
//     setIsModalOpen(true);

//     try {
//       const encodedValue = encodeURIComponent(String(valueToSend)); // Assurer que c'est une string
//       const url = `http://localhost:3001/api/players/filter?property=${filterProperty.trim().toLowerCase()}&value=${encodedValue}`;
//       console.log(`[CLICK] Appel API filtre: ${url}`);
//       const response = await fetch(url);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
//         throw new Error(errorData.error || `Erreur filtre ${response.status}`);
//       }
//       const players: Player[] = await response.json();
//       console.log('[CLICK] Joueurs filtrés reçus:', players);
//       setFilteredPlayers(players);

//     } catch (err) {
//       console.error('[CLICK] Erreur handleChartClick fetch:', err);
//       setFilterError(err instanceof Error ? err.message : 'Erreur inconnue filtre');
//       setFilteredPlayers(null);
//     } finally {
//       setIsFiltering(false);
//     }
//   };

//   // --- Fonction pour FERMER le modal (inchangée) ---
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setFilteredPlayers(null);
//     setCurrentFilterInfo(null);
//     setFilterError(null);
//     setIsFiltering(false);
//     setSearchTerm('');
//   };

//   // --- Calcul des joueurs à afficher dans le modal (inchangé) ---
//   const playersToDisplay = filteredPlayers
//     ? filteredPlayers.filter(player => {
//         const term = searchTerm.toLowerCase();
//         // Recherche multi-champs (inchangée)
//         return (
//           player.name?.toLowerCase().includes(term) || // Ajouter ?. pour sécurité
//           player.team?.toLowerCase().includes(term) ||
//           String(player.number).toLowerCase().includes(term) ||
//           player.position?.toLowerCase().includes(term)
//         );
//       })
//     : [];

//   // --- Choix du type de graphique (inchangé) ---
//   const getChartType = (target: string): 'bar' | 'doughnut' | 'line' | 'pie' | 'radar' => {
//     switch (target) {
//       case 'Position': return 'doughnut';
//       case 'Salary': return 'pie'; // Exemple: Pie pour Salary
//       case 'Age':
//       case 'Team':
//       case 'College':
//       case 'Height':
//       case 'Number':
//       case 'Weight':
//       default: return 'bar';
//     }
//   };

//   const chartType = getChartType(selectedTarget);

//   // --- Options du graphique ---
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     onClick: handleChartClick,
//     scales: (chartType === 'bar' || chartType === 'line') ? {
//       y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
//       x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
//     } : undefined, // Pas d'axes pour Pie/Doughnut/Radar par défaut
//     plugins: {
//         legend: { // S'assurer que la légende est activée
//             display: true,
//             position: 'top' as const,
//         },
//         title: { // S'assurer que le titre est activé (si vous le voulez)
//             display: true,
//             // Le titre est maintenant DANS les données (dataset.label), mais on peut en ajouter un global
//              text: `Répartition des Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`,
//              padding: { top: 10, bottom: 20 }
//         },
//         tooltip: {
//             callbacks: {
//             label: function(context: any) {
//                 // Utilisation de optional chaining pour la sécurité
//                 let label = context.dataset?.label || ''; // <-- Utilise le label DÉFINI dans dataset
//                 if (label) { label += ': '; }
//                 // Pour Doughnut/Pie, context.formattedValue est souvent ce qu'on veut
//                 if (context.formattedValue !== null && context.formattedValue !== undefined) {
//                      label += context.formattedValue;
//                 // Pour Bar/Line, context.parsed.y est la valeur
//                 } else if (context.parsed?.y !== null && context.parsed?.y !== undefined) {
//                     label += context.parsed.y;
//                 }
//                 return label;
//             }
//             }
//         }
//     }
//   };

//   // --- Rendu du Graphique ---
//   const renderChart = () => {
//      // **** LOG CRUCIAL 3 ****
//      console.log(`[RENDER] Attempting to render chart. Current chartData state:`, chartData ? JSON.stringify(chartData) : 'null');

//     // Vérification plus robuste avant rendu
//     if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || !chartData.labels || chartData.labels.length === 0) {
//       // Si le chargement est terminé et qu'il n'y a pas d'erreur, mais pas de données, afficher message
//       if (!isLoading && !error) {
//          console.log(`[RENDER] No chart data available or labels are empty. Displaying message.`);
//          return <p style={{textAlign: 'center', marginTop: '50px'}}>
//                   Aucune donnée disponible pour afficher le graphique "{selectedTarget}". Vérifiez les filtres ou la source de données.
//                 </p>;
//       }
//       // Sinon (chargement ou erreur gérée ailleurs), ne rien rendre ici
//        console.log(`[RENDER] Chart data not ready yet (isLoading=${isLoading}, error=${error}). Returning null.`);
//       return null;
//     }

//     // **** LOG CRUCIAL 4 ****
//     // Vérification spécifique du label juste avant de passer les données au composant Chart
//     const labelFromState = chartData.datasets[0]?.label;
//     console.log(`[RENDER] Label from chartData state before passing to component: "${labelFromState}" (Type: ${typeof labelFromState})`);
//     if (typeof labelFromState !== 'string' || labelFromState === '') {
//         console.error(`[RENDER] ****** ATTENTION: Label invalide détecté juste avant le rendu! ****** Label:`, labelFromState);
//         // Optionnel: Vous pourriez même forcer un label par défaut ici pour éviter l'erreur visuelle
//         // chartData.datasets[0].label = `Données pour ${selectedTarget}`;
//     }

//     // Logique de rendu du type de chart (inchangée, mais avec options typées)
//     const typedChartOptions: any = chartOptions; // Chart.js types peuvent être complexes, 'any' ici simplifie
//     console.log(`[RENDER] Rendering chart type: ${chartType}`);

//     switch (chartType) {
//       case 'bar': return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={typedChartOptions} />;
//       case 'doughnut': return <Doughnut ref={chartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={typedChartOptions} />;
//       case 'line': return <Line ref={chartRef as React.MutableRefObject<ChartJS<'line'> | null>} data={chartData} options={typedChartOptions} />;
//       case 'pie': return <Pie ref={chartRef as React.MutableRefObject<ChartJS<'pie'> | null>} data={chartData} options={typedChartOptions} />;
//       case 'radar': return <Radar ref={chartRef as React.MutableRefObject<ChartJS<'radar'> | null>} data={chartData} options={typedChartOptions} />;
//       default: return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={typedChartOptions} />;
//     }
//   };

//   // --- Rendu JSX Principal (inchangé) ---
//   return (
//     <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
//       {/* Sidebar (inchangée) */}
//       <ChartFilterSidebar
//         targets={['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary']}
//         selectedTarget={selectedTarget}
//         onSelectTarget={setSelectedTarget}
//         isLoading={isLoading}
//       />

//       {/* Zone Droite (Graphique) */}
//       <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//         <h2 style={{textAlign: 'center', marginTop: 0, marginBottom: '20px'}}>Statistiques des Joueurs</h2> {/* Ajout titre global */}
//         <div style={{ flexGrow: 1, position: 'relative', minHeight: '300px', width: '100%' }}> {/* Assurer width 100% */}
//           {isLoading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Chargement du graphique...</div>}
//           {error && <div style={{ color: 'red', textAlign: 'center', padding: '50px', border: '1px solid red', borderRadius: '4px' }}>
//                      <strong>Erreur lors du chargement du graphique:</strong><br/>{error}
//                    </div>}
//           {/* La fonction renderChart gère maintenant l'état "pas de données" */}
//           {!isLoading && !error && (
//             <div style={{ height: '100%', width: '100%' }}>
//               {renderChart()}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- MODAL (inchangé structurellement, mais utilise playersToDisplay calculé avant) --- */}
//       {isModalOpen && (
//         <>
//           {/* Overlay */}
//           <div onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 999, }} />
//           {/* Contenu du Modal */}
//           <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '700px', maxHeight: '85vh', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
//             {/* Bouton Fermer */}
//             <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666', lineHeight: 1, padding: 0 }} aria-label="Fermer"> × </button>

//             {/* Titre du Modal */}
//             {currentFilterInfo && (
//               <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
//                 Joueurs pour {currentFilterInfo.property === 'Salary' ? 'Tranche de Salaire' : currentFilterInfo.property} : "{String(currentFilterInfo.label)}"
//               </h3>
//             )}

//             {/* BARRE DE RECHERCHE (inchangée) */}
//             <input
//               type="text"
//               placeholder="Rechercher par nom, équipe, n°, pos..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ padding: '8px 12px', marginBottom: '15px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px', width: 'calc(100% - 24px)', }}
//             />

//             {/* Contenu variable */}
//             <div style={{ overflowY: 'auto', flexGrow: 1 }}>
//               {isFiltering && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Chargement des joueurs...</p>}
//               {filterError && <p style={{ color: 'red', textAlign: 'center' }}>Erreur: {filterError}</p>}

//               {/* Logique d'affichage conditionnel améliorée */}
//               {!isFiltering && !filterError && !filteredPlayers && currentFilterInfo && (
//                  // Cas juste après clic, avant que les données arrivent (ne devrait pas être visible longtemps)
//                  <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Préparation de la liste...</p>
//               )}

//                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
//                 // Cas où le filtre API n'a rien retourné
//                 <p style={{ textAlign: 'center' }}>Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'la tranche' : 'la catégorie'} "{String(currentFilterInfo.label)}".</p>
//               )}

//               {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length > 0 && playersToDisplay.length === 0 && (
//                 // Cas où le filtre API a des joueurs, mais la recherche vide la liste
//                 <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop:'10px' }}>Aucun joueur ne correspond à votre recherche "{searchTerm}" dans cette sélection.</p>
//               )}

//               {/* Afficher la liste si playersToDisplay a des éléments */}
//               {playersToDisplay.length > 0 && (
//                 <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
//                   {playersToDisplay.map((player, index) => (
//                     <li key={player.id || `${player.name}-${index}`}
//                         style={{ padding: '10px 5px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '8px 15px', fontSize: '0.9em' }}>
//                       {/* Utilisation de optional chaining pour plus de robustesse */}
//                       <strong style={{ minWidth: '120px' }}>{player.name ?? 'N/A'}</strong>
//                       <span>(#{player.number ?? 'N/A'})</span>
//                       <span>{player.position ?? 'N/A'}</span>
//                       <span>{player.team ?? 'N/A'}</span>
//                       <span>Age: {player.age ?? '?'}</span>
//                       <span>Taille: {player.height ?? '?'}</span>
//                       <span>Poids: {player.weight ? `${player.weight}kg` : '?'}</span>
//                       {player.college && <span>Collège: {player.college}</span>}
//                       {player.salary !== null && player.salary !== undefined && (
//                         <span>Salaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(player.salary)}</span>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div> {/* Fin de la zone scrollable */}
//           </div> {/* Fin du contenu du modal */}
//         </>
//       )}
//     </div>
//   );
// };

// export default PlayerChart;

import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement, ChartOptions // Import ChartOptions type
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
// Assurez-vous que ces chemins sont corrects pour votre structure de projet
import { Player, ChartResponseData, ChartStateData } from '../types';
import { generateColors } from '../utils/index.d.ts';
import ChartFilterSidebar from './ChartFilterSidebar';

// Enregistrement ChartJS (inchangé)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

const PlayerChart: React.FC = () => {
  // --- États (inchangés) ---
  const [chartData, setChartData] = useState<ChartStateData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null); // Joueurs reçus du backend après filtre
  const [isFiltering, setIsFiltering] = useState<boolean>(false); // État de chargement pour le modal
  const [filterError, setFilterError] = useState<string | null>(null); // Erreur spécifique au filtrage du modal
  const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Pour la recherche DANS le modal

  const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

  // --- Effet pour charger les données du GRAPHIQUE (Stats agrégées) ---
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      // Réinitialisation lors du changement de graphique
      setFilteredPlayers(null);
      setCurrentFilterInfo(null);
      setFilterError(null);
      setIsModalOpen(false);
      setSearchTerm('');

      const targetParam = selectedTarget.toLowerCase();
      console.log(`[EFFECT] Fetching chart stats for: ${targetParam}`);

      try {
        const response = await fetch(`http://localhost:3001/api/players/stats/${targetParam}`); // Appel API Stats
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: ChartResponseData = await response.json();
        console.log(`[EFFECT] Received stats data for ${targetParam}:`, data);

        // Validations des données reçues (importantes)
        if (!data || !data.labels || !data.data || !Array.isArray(data.labels) || !Array.isArray(data.data)) {
          console.warn(`[EFFECT] Invalid stats data format for ${targetParam}`, data);
          setError(`Format de données invalide reçu pour ${selectedTarget}.`);
          setChartData(null);
          setIsLoading(false);
          return;
        }

        if (data.labels.length === 0) {
           console.warn(`[EFFECT] No aggregated data found for ${targetParam}`);
           // Afficher un graphique "vide" avec un label clair
           setChartData({
             labels: [], // Garder les labels vides pour que le rendu ne crashe pas
             datasets: [{
               label: `Aucune donnée pour ${selectedTarget}`,
               data: [],
               backgroundColor: [], borderColor: [], borderWidth: 1,
             }]
           });
           setIsLoading(false);
           return;
         }


        const numLabels = data.labels.length;
        const backgroundColors = generateColors(numLabels);
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Création du label pour le dataset du graphique
        const chartLabel = `Nombre de Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`;
        console.log(`[EFFECT] Generated chartLabel for ${selectedTarget}: "${chartLabel}"`);

        const newChartData = {
          labels: data.labels,
          datasets: [{
            label: chartLabel,
            data: data.data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          }],
        };

        console.log(`[EFFECT] Setting chartData state for ${selectedTarget}.`);
        setChartData(newChartData);

      } catch (err) {
        console.error(`[EFFECT] Error fetching stats for ${targetParam}:`, err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setChartData(null); // Nettoyer en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [selectedTarget]);

  // --- Fonction de CLIC sur le graphique (Appel API de FILTRE) ---
  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    // Vérifications initiales
    if (elements.length === 0 || !chartData || !chartData.labels || chartData.labels.length === 0) return;
    const { index } = elements[0];
    if (index < 0 || index >= chartData.labels.length) {
        console.warn("[CLICK] Invalid click index:", index);
        return;
    }

    // Récupération des infos du clic
    const clickedLabel = chartData.labels[index];
    const filterProperty = selectedTarget; // La propriété correspond au graphique actuel

    // La valeur à envoyer est le label cliqué (ex: 'C', '1M - 5M', 25)
    const valueToSend = clickedLabel;

    console.log(`[CLICK] Chart segment clicked: Property='${filterProperty}', Value='${valueToSend}'`);

    // Préparer l'affichage du modal
    setIsFiltering(true); // Active l'indicateur de chargement du modal
    setFilterError(null);
    setFilteredPlayers(null); // Vider les anciens joueurs
    setSearchTerm(''); // Vider la recherche précédente
    setCurrentFilterInfo({ property: filterProperty, label: valueToSend }); // Stocker l'info du filtre actuel
    setIsModalOpen(true); // Ouvrir le modal

    // --- APPEL API BACKEND POUR FILTRER LES JOUEURS ---
    try {
      // Encoder la valeur pour l'URL (important si la valeur contient des caractères spéciaux)
      const encodedValue = encodeURIComponent(String(valueToSend));
      const url = `http://localhost:3001/api/players/filter?property=${filterProperty.trim().toLowerCase()}&value=${encodedValue}`;

      console.log(`[CLICK] Calling filter API: ${url}`);
      const response = await fetch(url); // Appel à la route /filter du backend

      if (!response.ok) {
        // Essayer de lire l'erreur JSON du backend
        const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }));
        throw new Error(errorData.error || `Erreur lors du filtrage (${response.status})`);
      }

      // Le backend renvoie DIRECTEMENT la liste des joueurs filtrés
      const players: Player[] = await response.json();
      console.log('[CLICK] Filtered players received from backend:', players);

      // Mettre à jour l'état avec les joueurs filtrés reçus
      setFilteredPlayers(players);

    } catch (err) {
      console.error('[CLICK] Error during fetch/filter:', err);
      // Afficher l'erreur dans le modal
      setFilterError(err instanceof Error ? err.message : 'Erreur inconnue lors du filtrage.');
      setFilteredPlayers(null); // S'assurer qu'aucune liste n'est affichée en cas d'erreur
    } finally {
      // Fin du chargement pour le modal (affiche soit les joueurs, soit une erreur, soit "aucun résultat")
      setIsFiltering(false);
    }
  };

  // --- Fermeture Modal (inchangée) ---
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset des états liés au modal
    setFilteredPlayers(null);
    setCurrentFilterInfo(null);
    setFilterError(null);
    setIsFiltering(false);
    setSearchTerm('');
  };

  // --- Filtrage CÔTÉ FRONTEND pour la barre de recherche DANS LE MODAL ---
  // S'applique sur la liste `filteredPlayers` déjà reçue du backend
  const playersToDisplay = filteredPlayers
    ? filteredPlayers.filter(player => {
        const term = searchTerm.toLowerCase();
        // Recherche sur plusieurs champs (peut être ajusté)
        return (
          player.name?.toLowerCase().includes(term) ||
          player.team?.toLowerCase().includes(term) ||
          String(player.number).toLowerCase().includes(term) || // Convertir nombre en string pour includes
          player.position?.toLowerCase().includes(term) ||
          player.college?.toLowerCase().includes(term)
        );
      })
    : []; // Retourne un tableau vide si filteredPlayers est null

  // --- Choix type/options graphique (adapté) ---
  const getChartType = (target: string): 'bar' | 'doughnut' | 'line' | 'pie' | 'radar' => {
     switch (target) {
       case 'Position': return 'doughnut';
       case 'Salary': return 'pie';
       case 'Age': return 'bar'; // Bar pour l'âge est souvent bien
       case 'Team': return 'bar'; // Bar pour équipe si beaucoup d'équipes, sinon Pie/Doughnut possible
       default: return 'bar';
     }
   };
  const chartType = getChartType(selectedTarget);

  // Options du graphique (type ChartOptions pour une meilleure auto-complétion)
  const chartOptions: ChartOptions<typeof chartType> = { // Typage des options
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick, // La fonction qui déclenche le filtre backend
    scales: (chartType === 'bar' || chartType === 'line') ? { // Seulement pour Bar/Line
      y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
      x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
    } : undefined,
    plugins: {
        legend: { display: true, position: 'top' },
        title: {
            display: true,
            // Le titre est dynamique basé sur selectedTarget
            text: `Répartition des Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`,
            padding: { top: 10, bottom: 20 },
            font: { size: 16 } // Ajuster la taille si besoin
        },
        tooltip: {
            callbacks: {
              label: function(context: any) {
                  // Utilise le label du dataset (défini dans useEffect)
                  let label = context.dataset?.label || '';
                  if (label) { label += ': '; }
                  // Fournit la valeur formatée ou parsée
                  label += context.formattedValue ?? context.parsed?.y ?? context.parsed ?? '';
                  return label;
              }
            }
        }
    }
  };

  // --- Rendu du Graphique (avec logs et vérifications robustes) ---
  const renderChart = () => {
     console.log(`[RENDER] Attempting render. isLoading=${isLoading}, error=${error}, chartData exists=${!!chartData}`);

    // Si chargement ou erreur globale, géré à l'extérieur
    if (isLoading || error) return null;

    // Si pas de données après chargement sans erreur
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || !chartData.labels ) {
       console.log(`[RENDER] No valid chart data to render for ${selectedTarget}.`);
       return <p style={{textAlign: 'center', marginTop: '50px', fontStyle: 'italic'}}>
                 {chartData?.datasets?.[0]?.label?.includes("Aucune donnée") // Vérifie le label spécifique "Aucune donnée"
                    ? `Aucune donnée trouvée pour ${selectedTarget}.`
                    : `Données non disponibles pour ${selectedTarget}.`
                 }
              </p>;
    }
    
    // Vérifier si les labels sont vides (cas géré dans l'effet mais double sécurité)
     if (chartData.labels.length === 0 && chartData.datasets[0]?.data.length === 0) {
         console.log(`[RENDER] Rendering message for empty data set: ${chartData.datasets[0]?.label}`);
         return <p style={{textAlign: 'center', marginTop: '50px', fontStyle: 'italic'}}>
                   {chartData.datasets[0]?.label ?? `Aucune donnée pour ${selectedTarget}.`}
                </p>;
     }


    // Log crucial avant rendu effectif
    const labelFromState = chartData.datasets[0]?.label;
    console.log(`[RENDER] Rendering ${chartType} chart for ${selectedTarget}. Dataset label: "${labelFromState}"`);
    if (typeof labelFromState !== 'string' || labelFromState === '') {
        console.error(`[RENDER] ****** ATTENTION: Invalid label detected just before rendering! Label:`, labelFromState);
        // Fallback possible :
        // if (chartData.datasets[0]) chartData.datasets[0].label = `Données pour ${selectedTarget}`;
    }

    // Rendu conditionnel basé sur chartType
    // Note: On passe les options typées `chartOptions`
    switch (chartType) {
      case 'bar': return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
      case 'doughnut': return <Doughnut ref={chartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={chartOptions as ChartOptions<'doughnut'>} />;
      case 'line': return <Line ref={chartRef as React.MutableRefObject<ChartJS<'line'> | null>} data={chartData} options={chartOptions as ChartOptions<'line'>} />;
      case 'pie': return <Pie ref={chartRef as React.MutableRefObject<ChartJS<'pie'> | null>} data={chartData} options={chartOptions as ChartOptions<'pie'>} />;
      case 'radar': return <Radar ref={chartRef as React.MutableRefObject<ChartJS<'radar'> | null>} data={chartData} options={chartOptions as ChartOptions<'radar'>} />;
      default: // Fallback sur Bar
        console.warn(`[RENDER] Unknown chart type '${chartType}', falling back to 'bar'.`);
        return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
    }
  };

  // --- Rendu JSX Principal (Structure inchangée, affichage conditionnel amélioré) ---
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}> {/* Empêche scroll global */}
      {/* Sidebar */}
      <ChartFilterSidebar
        targets={['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary']}
        selectedTarget={selectedTarget}
        onSelectTarget={(target) => { if (!isLoading) setSelectedTarget(target); }} // Empêche clic pendant chargement
        isLoading={isLoading} // Passe l'état de chargement global
      />

      {/* Zone Droite (Graphique) */}
      <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}> {/* Permet scroll si contenu dépasse */}
        <h2 style={{textAlign: 'center', marginTop: 0, marginBottom: '20px', flexShrink: 0}}>Statistiques des Joueurs NBA</h2>
        <div style={{ flexGrow: 1, position: 'relative', minHeight: '400px', width: '100%' }}> {/* Hauteur min + width */}
          {/* Affichage conditionnel centralisé */}
          {isLoading && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
                <p style={{ fontSize: '1.2em', color: '#555' }}>Chargement des données...</p>
            </div>
          )}
          {error && (
             <div style={{ padding: '20px', margin: '20px', border: '1px solid #e57373', borderRadius: '4px', backgroundColor: '#ffebee', color: '#c62828', textAlign: 'center' }}>
               <strong>Erreur lors du chargement :</strong><br/>{error}
             </div>
          )}
          {/* Le rendu du graphique (ou message "pas de données") se fait ici */}
          {!isLoading && !error && (
            <div style={{ height: '100%', width: '100%' }}>
              {renderChart()}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {/* Condition d'ouverture inchangée */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 999 }} />
          {/* Contenu Modal */}
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '85vh', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', flexShrink: 0 }}>
              {currentFilterInfo && (
                <h3 style={{ margin: 0 }}>
                  Joueurs: {currentFilterInfo.property} "{String(currentFilterInfo.label)}"
                </h3>
              )}
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#888', lineHeight: 1, padding: 0 }} aria-label="Fermer">×</button>
            </div>

             {/* Barre de recherche */}
             <input
               type="text"
               placeholder="Filtrer par nom, équipe, n°, position..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ padding: '10px 12px', marginBottom: '15px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box', flexShrink: 0 }}
               disabled={isFiltering || !!filterError} // Désactiver si chargement ou erreur
             />

            {/* Zone de contenu scrollable */}
            <div style={{ overflowY: 'auto', flexGrow: 1, minHeight: '100px' }}> {/* Hauteur min pour visibilité */}
              {/* Indicateur de chargement spécifique au modal */}
              {isFiltering && <p style={{ textAlign: 'center', padding: '30px 0', fontStyle: 'italic', color: '#555' }}>Chargement des joueurs...</p>}

              {/* Affichage de l'erreur spécifique au filtre */}
              {filterError && <p style={{ color: '#c62828', textAlign: 'center', padding: '20px', border: '1px solid #e57373', borderRadius: '4px', backgroundColor: '#ffebee' }}>Erreur: {filterError}</p>}

              {/* Affichage des résultats (ou messages si aucun résultat) */}
              {!isFiltering && !filterError && (
                <>
                  {/* Cas 1: Le filtre backend n'a RIEN retourné */}
                  {filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                    <p style={{ textAlign: 'center', padding: '30px 0', color: '#555' }}>
                      Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'cette tranche de salaire' : `la catégorie "${String(currentFilterInfo.label)}"`}.
                    </p>
                  )}

                  {/* Cas 2: Le filtre backend a retourné des joueurs, MAIS la recherche frontend les masque */}
                  {filteredPlayers && filteredPlayers.length > 0 && playersToDisplay.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '30px 0', fontStyle: 'italic', color: '#777' }}>
                      Aucun joueur ne correspond à votre recherche "{searchTerm}" dans cette sélection.
                    </p>
                  )}

                  {/* Cas 3: Afficher la liste des joueurs filtrés (par backend ET par recherche modal) */}
                  {playersToDisplay.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {playersToDisplay.map((player, index) => (
                        <li key={player.id || `${player.name}-${index}`} // Utiliser ID si disponible
                            style={{ padding: '12px 8px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '10px 15px', fontSize: '0.9em', alignItems: 'center' }}>
                          <strong style={{ minWidth: '150px', flexBasis: '150px' }}>{player.name ?? 'N/A'}</strong>
                          <span style={{ color: '#666' }}>{player.team ?? 'N/A'}</span>
                          <span style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{player.position ?? '?'}</span>
                          <span style={{ color: '#888' }}>(#{player.number ?? '?'})</span>
                          <span style={{ marginLeft: 'auto', color: '#333' }}>Age: {player.age ?? '?'}</span>
                          {/* Affichage optionnel et formaté */}
                          {player.height && <span style={{ color: '#555' }}>Ht: {player.height}</span>}
                          {player.weight && <span style={{ color: '#555' }}>Wt: {player.weight}kg</span>}
                          {player.college && <span style={{ fontSize: '0.85em', color: '#777', flexBasis: '100%', textAlign: 'left' }}>Collège: {player.college}</span>}
                          {player.salary !== null && player.salary !== undefined && (
                            <span style={{ fontWeight: 'bold', color: '#007acc', flexBasis: '100%', textAlign: 'right' }}>
                              Salaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(player.salary)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div> {/* Fin zone scrollable */}
          </div> {/* Fin contenu modal */}
        </>
      )}
    </div>
  );
};

export default PlayerChart;