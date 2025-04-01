import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';

// ... (imports et interfaces inchangés) ...
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
  labels: (string | number)[]; // Sera string[] pour les salaires maintenant
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}


const PlayerChart: React.FC = () => {
  // ... (états inchangés) ...
  const [chartData, setChartData] = useState<ChartStateData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);


  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData(null);
      setFilteredPlayers(null);
      setCurrentFilterInfo(null);
      setFilterError(null);
      setIsModalOpen(false);

      const targetParam = selectedTarget.toLowerCase();

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

        // --- Plus besoin de formater les labels de salaire ici ---
        // Le backend renvoie directement les labels de tranches ("< 1M", "1M - 5M", etc.)

        const generateColors = (numColors: number): string[] => {
             // ... (fonction generateColors inchangée) ...
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
          labels: data.labels, // Utiliser directement les labels reçus (seront des strings pour les salaires)
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

  // --- Fonction de CLIC sur le graphique ---
  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length === 0 || !chartData || !chartData.labels) return;

    const { index } = elements[0];
    // Le label cliqué est maintenant soit une valeur (Age, Team...) soit un label de tranche (Salary)
    const clickedLabel = chartData.labels[index];
    const filterProperty = selectedTarget;

    console.log(`Clic détecté: Propriété='${filterProperty}', Label/Tranche='${clickedLabel}'`);

    // --- Logique simplifiée pour la valeur à envoyer ---
    // Pas besoin de parser si c'est un salaire, on envoie le label de la tranche directement
    const valueToSend = clickedLabel;

    setIsFiltering(true);
    setFilterError(null);
    setFilteredPlayers(null);
    // Mémoriser le label cliqué (peut être une valeur ou une tranche) pour l'affichage du titre modal
    setCurrentFilterInfo({ property: filterProperty, label: clickedLabel });
    setIsModalOpen(true);

    try {
      // Envoyer le label (valeur ou tranche) encodé à l'API
      const encodedValue = encodeURIComponent(String(valueToSend));
      const url = `http://localhost:3001/api/players/filter?property=${filterProperty.toLowerCase()}&value=${encodedValue}`;
      console.log(`Appel API filtre: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        throw new Error(errorData.error || `Erreur filtre ${response.status}`);
      }
      const players: Player[] = await response.json();
      console.log('Joueurs filtrés reçus:', players);
      setFilteredPlayers(players);

    } catch (err) {
      console.error('Erreur handleChartClick fetch:', err);
      setFilterError(err instanceof Error ? err.message : 'Erreur inconnue filtre');
      setFilteredPlayers(null);
    } finally {
      setIsFiltering(false);
    }
  };

  // --- Fonction pour FERMER le modal (inchangée) ---
  const closeModal = () => {
      setIsModalOpen(false);
       setFilteredPlayers(null);
       setCurrentFilterInfo(null);
       setFilterError(null);
       setIsFiltering(false);
  };

  // --- Type de graphique (inchangé) ---
  const getChartType = (target: string): string => {
     switch (target) {
      // ... autres cas ...
      case 'Salary': return 'bar';
      default: return 'bar';
    }
  };
  const chartType = getChartType(selectedTarget);

  // --- Options du graphique ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    scales: (chartType === 'bar' || chartType === 'line') ? {
       y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
       // Pour les salaires, l'axe X affiche maintenant les tranches
       x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
     } : undefined,
     plugins: {
         tooltip: {
             callbacks: {
                 // Le callback par défaut devrait bien fonctionner avec les labels de tranche
                 label: function(context: any) {
                     let label = context.dataset.label || '';
                     if (label) { label += ': '; }
                     if (context.parsed.y !== null) { label += context.parsed.y; }
                     // Le context.label est maintenant la tranche de salaire ("< 1M", etc.)
                     // Ou la valeur pour les autres graphiques
                     return label;
                 }
             }
         }
     }
  };

  // --- Fonction pour rendre le GRAPHIQUE (inchangée) ---
   const renderChart = () => {
     // ... (logique renderChart inchangée) ...
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

  // --- Rendu JSX Principal (inchangé sauf peut-être le bouton Salary) ---
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Menu Gauche */}
      <div style={{ width: '220px', backgroundColor: '#f8f9fa', padding: '20px', overflowY: 'auto', borderRight: '1px solid #dee2e6' }}>
         <h3>Filtres Graphique</h3>
        {['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary'].map((target) => (
           // ... (boutons inchangés) ...
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
            {target} {/* Le texte du bouton reste "Salary" */}
          </button>
        ))}
      </div>

      {/* Zone Droite (Graphique) */}
      <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ... (rendu graphique inchangé) ... */}
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

       {/* --- MODAL (inchangé dans sa structure, le titre affichera la tranche) --- */}
       {isModalOpen && (
         <>
           {/* Overlay */}
           <div onClick={closeModal} style={{ /* ... styles overlay ... */ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 999, }} />
           {/* Contenu du Modal */}
           <div style={{ /* ... styles modal ... */ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '700px', maxHeight: '85vh', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
              {/* Bouton Fermer */}
             <button onClick={closeModal} style={{ /* ... styles bouton fermer ... */ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666', lineHeight: 1, padding: 0 }} aria-label="Fermer"> × </button>
             {/* Titre du Modal */}
              {currentFilterInfo && (
                 <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                   {/* Le titre affiche maintenant la tranche de salaire si c'est le cas */}
                   Joueurs pour {currentFilterInfo.property === 'Salary' ? 'Tranche de Salaire' : currentFilterInfo.property} : "{String(currentFilterInfo.label)}"
                 </h3>
              )}
             {/* Contenu variable */}
             <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                {isFiltering && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Chargement des joueurs...</p>}
                {filterError && <p style={{ color: 'red', textAlign: 'center' }}>Erreur: {filterError}</p>}
                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                    <p style={{ textAlign: 'center' }}>Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'la tranche' : ''} "{String(currentFilterInfo.label)}".</p>
                )}
                {!isFiltering && !filterError && filteredPlayers && filteredPlayers.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredPlayers.map((player, index) => (
                       // ... (rendu de la liste li inchangé, le salaire individuel est toujours formaté) ...
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
             </div>
           </div>
         </>
       )}
    </div>
  );
};

export default PlayerChart;