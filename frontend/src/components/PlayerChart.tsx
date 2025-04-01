import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

interface Player {
  id?: number | string;
  name: string;
  team: string;
  number: number | string;
  position: string;
  age: number;
  height: string;
  weight: number;
  college: string | null;
  salary: number | null;
}

interface ChartResponseData {
  labels: (string | number)[];
  data: number[];
}

interface ChartStateData {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}


const PlayerChart: React.FC = () => {
  // --- États existants ---
  const [chartData, setChartData] = useState<ChartStateData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // *** NOUVEL ÉTAT pour la barre de recherche du modal ***
  const [searchTerm, setSearchTerm] = useState<string>('');

  const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

  // --- Effet pour charger les données du GRAPHIQUE (inchangé) ---
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData(null);
      // Réinitialiser le filtre ET fermer le modal si on change de graphique
      setFilteredPlayers(null);
      setCurrentFilterInfo(null);
      setFilterError(null);
      setIsModalOpen(false);
      setSearchTerm(''); // *** Réinitialiser la recherche aussi ***

      const targetParam = selectedTarget.toLowerCase();
      // ... (reste de la logique fetchChartData inchangée) ...
       try {
         console.log(`Fetching chart data for: ${targetParam}`);
         const response = await fetch(`http://localhost:3001/api/players/stats/${targetParam}`);
         if (!response.ok) {
           const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
           throw new Error(errorData.error || `HTTP error ${response.status}`);
         }
         const data: ChartResponseData = await response.json();

         if (!data || !data.labels || !data.data || data.labels.length === 0) {
             console.warn("Données agrégées vides ou mal formatées reçues pour", targetParam);
             setChartData({ labels: [], datasets: []});
             setIsLoading(false);
             return;
         }

         const generateColors = (numColors: number): string[] => {
              const colors: string[] = [];
              const baseColors = [
                  'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                  'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)', 'rgba(255, 102, 183, 0.6)'
              ];
              for (let i = 0; i < numColors; i++) {
                  colors.push(baseColors[i % baseColors.length]);
              }
               if (numColors > baseColors.length) {
                   console.warn(`Plus de ${baseColors.length} labels (${numColors}), les couleurs vont se répéter.`);
              }
              return colors;
         };

         const numLabels = data.labels.length;
         const backgroundColors = generateColors(numLabels);
         const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

         setChartData({
           labels: data.labels,
           datasets: [ {
               label: `Nombre de Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`,
               data: data.data,
               backgroundColor: backgroundColors,
               borderColor: borderColors,
               borderWidth: 1,
             },],
         });
       } catch (err) {
         console.error('Erreur fetchChartData:', err);
         setError(err instanceof Error ? err.message : 'Erreur inconnue');
       } finally {
         setIsLoading(false);
       }
    };

    fetchChartData();
  }, [selectedTarget]);

  // --- Fonction de CLIC sur le graphique (modifiée pour réinitialiser la recherche) ---
  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length === 0 || !chartData || !chartData.labels) return;

    const { index } = elements[0];
    const clickedLabel = chartData.labels[index];
    const filterProperty = selectedTarget;

    console.log(`Clic détecté: Propriété='${filterProperty}', Label/Tranche='${clickedLabel}'`);

    const valueToSend = clickedLabel;

    // *** Réinitialiser l'état du modal AVANT de charger de nouvelles données ***
    setIsFiltering(true);
    setFilterError(null);
    setFilteredPlayers(null);
    setSearchTerm('');
    setCurrentFilterInfo({ property: filterProperty, label: clickedLabel });
    setIsModalOpen(true);

    try {
      const encodedValue = encodeURIComponent(String(valueToSend));
      const url = `http://localhost:3001/api/players/filter?property=${filterProperty.trim().toLowerCase()}&value=${encodedValue}`;
      console.log(`Appel API filtre: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        throw new Error(errorData.error || `Erreur filtre ${response.status}`);
      }
      const players: Player[] = await response.json();
      console.log('Joueurs filtrés reçus:', players);
      setFilteredPlayers(players); // Mettre à jour avec les nouveaux joueurs

    } catch (err) {
      console.error('Erreur handleChartClick fetch:', err);
      setFilterError(err instanceof Error ? err.message : 'Erreur inconnue filtre');
      setFilteredPlayers(null); // S'assurer qu'il n'y a pas de joueurs en cas d'erreur
    } finally {
      setIsFiltering(false); // Fin du chargement (le modal affiche le résultat ou l'erreur)
    }
  };

  // --- Fonction pour FERMER le modal (réinitialise aussi la recherche) ---
  const closeModal = () => {
      setIsModalOpen(false);
       setFilteredPlayers(null);
       setCurrentFilterInfo(null);
       setFilterError(null);
       setIsFiltering(false);
       setSearchTerm(''); // *** Réinitialiser la recherche en fermant ***
  };

  // --- Calcul des joueurs à afficher dans le modal (filtrés par la recherche) ---
  // Ceci est fait juste avant le rendu du modal pour toujours avoir la liste à jour
  const playersToDisplay = filteredPlayers
    ? filteredPlayers.filter(player => {
        const term = searchTerm.toLowerCase();
        // Recherche sur plusieurs champs (nom, équipe, numéro, position) - Ajustez si nécessaire
        return (
          player.name.toLowerCase().includes(term) ||
          player.team.toLowerCase().includes(term) ||
          String(player.number).toLowerCase().includes(term) ||
          player.position.toLowerCase().includes(term)
        );
      })
    : [];

   const getChartType = (target: string): string => {
      switch (target) {
       case 'Age': return 'bar';
       case 'Position': return 'doughnut';
       case 'Team': return 'bar';
       case 'College': return 'bar';
       case 'Height': return 'bar';
       case 'Number': return 'bar';
       case 'Weight': return 'bar';
       case 'Salary': return 'bar';
       default: return 'bar';
     }
   };
   const chartType = getChartType(selectedTarget);
   const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     onClick: handleChartClick,
     scales: (chartType === 'bar' || chartType === 'line') ? {
        y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
        x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
      } : undefined,
      plugins: {
          tooltip: {
              callbacks: {
                  label: function(context: any) {
                      let label = context.dataset.label || '';
                      if (label) { label += ': '; }
                      if (context.parsed.y !== null) { label += context.parsed.y; }
                      return label;
                  }
              }
          }
      }
   };
    const renderChart = () => {
      if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
         if (!isLoading) return <p>Aucune donnée disponible pour afficher le graphique "{selectedTarget}".</p>;
         return null;
     }
      const typedChartOptions: any = chartOptions;
      switch (chartType) {
        case 'bar': return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={typedChartOptions} />;
        case 'doughnut': return <Doughnut ref={chartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={typedChartOptions} />;
        case 'line': return <Line ref={chartRef as React.MutableRefObject<ChartJS<'line'> | null>} data={chartData} options={typedChartOptions} />;
        case 'pie': return <Pie ref={chartRef as React.MutableRefObject<ChartJS<'pie'> | null>} data={chartData} options={typedChartOptions} />;
        case 'radar': return <Radar ref={chartRef as React.MutableRefObject<ChartJS<'radar'> | null>} data={chartData} options={typedChartOptions} />;
        default: return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={typedChartOptions} />;
      }
    };


  // --- Rendu JSX Principal ---
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Menu Gauche (inchangé) */}
      <div style={{ width: '220px', backgroundColor: '#f8f9fa', padding: '20px', overflowY: 'auto', borderRight: '1px solid #dee2e6' }}>
         <h3>Filtres Graphique</h3>
        {['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary'].map((target) => (
           <button
            key={target}
            onClick={() => setSelectedTarget(target)}
            disabled={isLoading}
            style={{
              display: 'block', width: '100%', margin: '8px 0', padding: '12px 15px', fontSize: '14px',
              backgroundColor: selectedTarget === target ? '#007bff' : (isLoading ? '#e9ecef' : 'white'),
              color: selectedTarget === target ? 'white' : '#495057',
              border: `1px solid ${selectedTarget === target ? '#007bff' : '#ced4da'}`,
              borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', textAlign: 'left',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          >
            {target}
          </button>
        ))}
      </div>

      {/* Zone Droite (Graphique) (inchangé) */}
      <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flexGrow: 1, position: 'relative', minHeight: '300px' }}>
          {isLoading && <div style={{ textAlign: 'center', padding: '50px' }}>Chargement du graphique...</div>}
          {error && <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Erreur chargement graphique: {error}</div>}
          {!isLoading && !error && (
            <div style={{ height: '100%', width: '100%' }}>
              {renderChart()}
            </div>
          )}
        </div>
      </div>

       {/* --- MODAL --- */}
       {isModalOpen && (
         <>
           {/* Overlay */}
           <div onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 999, }} />

           {/* Contenu du Modal */}
           <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '700px', maxHeight: '85vh', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
             {/* Bouton Fermer */}
             <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666', lineHeight: 1, padding: 0 }} aria-label="Fermer"> × </button>

             {/* Titre du Modal */}
              {currentFilterInfo && (
                 <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                   Joueurs pour {currentFilterInfo.property === 'Salary' ? 'Tranche de Salaire' : currentFilterInfo.property} : "{String(currentFilterInfo.label)}"
                 </h3>
              )}

              {/* *** BARRE DE RECHERCHE *** */}
              <input
                type="text"
                placeholder="Rechercher par nom, équipe, n°, pos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    padding: '8px 12px',
                    marginBottom: '15px',
                    fontSize: '1em',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: 'calc(100% - 24px)',
                 }}
               />

             {/* Contenu variable (Chargement / Erreur / Liste filtrée par recherche) */}
             <div style={{ overflowY: 'auto', flexGrow: 1 }}> {/* Zone scrollable */}
                {isFiltering && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Chargement des joueurs...</p>}
                {filterError && <p style={{ color: 'red', textAlign: 'center' }}>Erreur: {filterError}</p>}

                {/* Affichage conditionnel basé sur filteredPlayers ET playersToDisplay */}
                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                    // Cas où le filtre initial (clic graphique) ne renvoie aucun joueur
                    <p style={{ textAlign: 'center' }}>Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'la tranche' : ''} "{String(currentFilterInfo.label)}".</p>
                )}

                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length > 0 && playersToDisplay.length === 0 && (
                    // Cas où le filtre initial a des joueurs, mais la recherche ne trouve rien
                    <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop:'10px' }}>Aucun joueur ne correspond à votre recherche "{searchTerm}" dans cette sélection.</p>
                )}

                {!isFiltering && !filterError && playersToDisplay.length > 0 && (
                  // Afficher la liste UNIQUEMENT si playersToDisplay n'est pas vide
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {playersToDisplay.map((player, index) => ( // *** Utiliser playersToDisplay ici ***
                      <li key={player.id || `${player.name}-${index}`}
                          style={{ padding: '10px 5px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '8px 15px', fontSize: '0.9em' }}>
                        <strong style={{ minWidth: '120px' }}>{player.name}</strong>
                        <span>(#{player.number})</span>
                        <span>{player.position}</span>
                        <span>{player.team}</span>
                        <span>Age: {player.age}</span>
                        <span>Taille: {player.height}</span>
                        <span>Poids: {player.weight}kg</span>
                        {player.college && <span>Collège: {player.college}</span>}
                        {player.salary !== null && player.salary !== undefined && (
                           <span>Salaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(player.salary)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
             </div> {/* Fin de la zone scrollable */}
           </div> {/* Fin du contenu du modal */}
         </>
       )}
       {/* --- Fin MODAL --- */}

    </div>
  );
};

export default PlayerChart;