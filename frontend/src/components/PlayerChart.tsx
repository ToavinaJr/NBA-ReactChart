import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';

// Enregistrer les composants nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

// --- INTERFACES ---
interface Player {
  id?: number | string; // Ajouter un ID si possible pour la key
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

// --- COMPOSANT ---
const PlayerChart: React.FC = () => {
  // États pour le graphique
  const [chartData, setChartData] = useState<ChartStateData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- États pour la liste filtrée (utilisés par le modal) ---
  const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);

  // --- NOUVEL état pour la visibilité du modal ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

  // --- Effet pour charger les données du GRAPHIQUE ---
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData(null);
      // Réinitialiser le filtre ET fermer le modal si on change de graphique
      setFilteredPlayers(null);
      setCurrentFilterInfo(null);
      setFilterError(null);
      setIsModalOpen(false); // Fermer le modal si ouvert

      const targetParam = selectedTarget.toLowerCase();

      try {
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
                colors.push(baseColors[i % baseColors.length]); // Cycle through base colors
            }
             // Si vraiment plus de couleurs que la base, on pourrait ajouter de la génération aléatoire ou plus de couleurs fixes
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
              label: `Nombre de Joueurs par ${selectedTarget}`,
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

  // --- Fonction de CLIC sur le graphique (modifiée pour ouvrir le modal) ---
  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length === 0 || !chartData || !chartData.labels) return;

    const { index } = elements[0];
    const clickedLabel = chartData.labels[index];
    const filterProperty = selectedTarget;

    console.log(`Clic détecté: Propriété='${filterProperty}', Label='${clickedLabel}'`);

    // Préparer l'état pour le modal et ouvrir le modal avec chargement
    setIsFiltering(true);
    setFilterError(null);
    setFilteredPlayers(null);
    setCurrentFilterInfo({ property: filterProperty, label: clickedLabel });
    setIsModalOpen(true); // <<<=== OUVRIR LE MODAL ICI

    try {
      const encodedValue = encodeURIComponent(String(clickedLabel));
      const url = `http://localhost:3001/api/players/filter?property=${filterProperty.toLowerCase()}&value=${encodedValue}`;
      console.log(`Appel API filtre: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        throw new Error(errorData.error || `Erreur filtre ${response.status}`);
      }
      const players: Player[] = await response.json();
      console.log('Joueurs filtrés reçus:', players);
      setFilteredPlayers(players); // Mettre à jour les données pour le modal

    } catch (err) {
      console.error('Erreur handleChartClick fetch:', err);
      setFilterError(err instanceof Error ? err.message : 'Erreur inconnue filtre');
      setFilteredPlayers(null);
    } finally {
      setIsFiltering(false); // Fin du chargement (le modal reste ouvert)
    }
  };

  // --- Fonction pour FERMER le modal ---
  const closeModal = () => {
      setIsModalOpen(false);
       setFilteredPlayers(null);
       setCurrentFilterInfo(null);
       setFilterError(null);
       setIsFiltering(false);
  };

  // --- Type de graphique ---
  const getChartType = (target: string): string => {
     switch (target) {
      case 'Age': return 'bar';
      case 'Position': return 'doughnut';
      case 'Team': return 'bar';
      case 'College': return 'bar';
      case 'Height': return 'bar';
      case 'Number': return 'bar';
      case 'Weight': return 'bar';
      default: return 'bar';
    }
  };
  const chartType = getChartType(selectedTarget);

  // --- Options du graphique (incluant onClick) ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick, // Lié à la fonction qui ouvre le modal
    scales: (chartType === 'bar' || chartType === 'line') ? { /* ... options scales ... */ } : undefined,
     ...(chartType === 'radar' && { /* ... options radar ... */ })
  };

  // --- Fonction pour rendre le GRAPHIQUE ---
  const renderChart = () => {
     if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
        if (!isLoading) return <p>Aucune donnée disponible pour afficher le graphique "{selectedTarget}".</p>;
        return null;
    }
    // ... (le reste de la fonction renderChart reste pareil, utilisant chartRef)
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
         {/* ... contenu du menu ... */}
         <h3>Filtres Graphique</h3>
        {['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight'].map((target) => (
          <button
            key={target}
            onClick={() => setSelectedTarget(target)}
            disabled={isLoading} // Désactiver seulement pendant le chargement du graphique initial
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

      {/* Zone Droite (Graphique seul maintenant) */}
      <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Section Graphique */}
        <div style={{ flexGrow: 1, position: 'relative', minHeight: '300px' }}> {/* Prend l'espace vertical */}
          {isLoading && <div style={{ textAlign: 'center', padding: '50px' }}>Chargement du graphique...</div>}
          {error && <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Erreur chargement graphique: {error}</div>}
          {!isLoading && !error && (
            <div style={{ height: '100%', width: '100%' }}>
              {renderChart()}
            </div>
          )}
           {/* On ne met plus la liste filtrée ici */}
        </div>
      </div>

       {/* --- MODAL --- */}
       {isModalOpen && (
         <>
           {/* Overlay (fond semi-transparent) */}
           <div
             onClick={closeModal} // Fermer en cliquant sur l'overlay
             style={{
               position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.6)', // Noir semi-transparent
               zIndex: 999, // Au-dessus de tout sauf le modal
             }}
           />

           {/* Contenu du Modal */}
           <div style={{
               position: 'fixed', top: '50%', left: '50%',
               transform: 'translate(-50%, -50%)', // Centrer
               width: '80%', maxWidth: '700px', // Largeur max
               maxHeight: '85vh', // Hauteur max
               backgroundColor: 'white',
               padding: '25px',
               borderRadius: '8px',
               boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
               zIndex: 1000, // Au-dessus de l'overlay
               display: 'flex', flexDirection: 'column', // Pour placer le bouton close et gérer le scroll interne
           }}>
             {/* Bouton Fermer (en haut à droite) */}
             <button
               onClick={closeModal}
               style={{
                 position: 'absolute', top: '10px', right: '15px',
                 background: 'none', border: 'none', fontSize: '1.5rem',
                 cursor: 'pointer', color: '#666', lineHeight: 1, padding: 0
               }}
               aria-label="Fermer" // Pour l'accessibilité
             >
               × {/* Symbole croix */}
             </button>

             {/* Titre du Modal */}
              {currentFilterInfo && (
                 <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                   Joueurs pour {currentFilterInfo.property} : "{String(currentFilterInfo.label)}"
                 </h3>
              )}

             {/* Contenu variable (Chargement / Erreur / Liste) */}
             <div style={{ overflowY: 'auto', flexGrow: 1 }}> {/* Zone scrollable */}
                {isFiltering && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Chargement des joueurs...</p>}
                {filterError && <p style={{ color: 'red', textAlign: 'center' }}>Erreur: {filterError}</p>}
                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                    <p style={{ textAlign: 'center' }}>Aucun joueur trouvé pour {currentFilterInfo.property} = "{String(currentFilterInfo.label)}".</p>
                )}
                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredPlayers.map((player, index) => (
                      <li key={player.id || `${player.name}-${index}`} /* Utiliser un ID si disponible */
                          style={{ padding: '10px 5px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '8px 15px', fontSize: '0.9em' }}>
                        <strong style={{ minWidth: '120px' }}>{player.name}</strong>
                        <span>(#{player.number})</span>
                        <span>{player.position}</span>
                        <span>{player.team}</span>
                        <span>Age: {player.age}</span>
                        <span>Taille: {player.height}</span>
                        <span>Poids: {player.weight}kg</span>
                        {player.college && <span>Collège: {player.college}</span>}
                        {/* Ajouter d'autres infos si pertinent */}
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