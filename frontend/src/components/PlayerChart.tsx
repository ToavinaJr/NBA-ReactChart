import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement, ChartOptions
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
import { Player, ChartResponseData, ChartStateData } from '../types';
import { generateColors } from '../utils/index.d.ts';
import ChartFilterSidebar from './ChartFilterSidebar';
import TeamsDetailsViewer from './TeamsDetailsViewer.tsx';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

const PlayerChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartStateData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
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

        if (!data || !data.labels || !data.data || !Array.isArray(data.labels) || !Array.isArray(data.data)) {
          console.warn(`[EFFECT] Invalid stats data format for ${targetParam}`, data);
          setError(`Format de données invalide reçu pour ${selectedTarget}.`);
          setChartData(null);
          setIsLoading(false);
          return;
        }

        if (data.labels.length === 0) {
           console.warn(`[EFFECT] No aggregated data found for ${targetParam}`);

           setChartData({
             labels: [],
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
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [selectedTarget]);

  // --- Fonction de CLIC sur le graphique (Appel API de FILTRE) ---
  const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
    console.log(event)
    // Vérifications initiales
    if (elements.length === 0 || !chartData || !chartData.labels || chartData.labels.length === 0) return;
    const { index } = elements[0];
    if (index < 0 || index >= chartData.labels.length) {
        console.warn("[CLICK] Invalid click index:", index);
        return;
    }

    const clickedLabel = chartData.labels[index];
    const filterProperty = selectedTarget;

    const valueToSend = clickedLabel;

    console.log(`[CLICK] Chart segment clicked: Property='${filterProperty}', Value='${valueToSend}'`);

    setIsFiltering(true);
    setFilterError(null);
    setFilteredPlayers(null);
    setSearchTerm('');
    setCurrentFilterInfo({ property: filterProperty, label: valueToSend });
    setIsModalOpen(true);

    
    try {

      const encodedValue = encodeURIComponent(String(valueToSend));
      const url = `http://localhost:3001/api/players/filter?property=${filterProperty.trim().toLowerCase()}&value=${encodedValue}`;

      console.log(`[CLICK] Calling filter API: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }));
        throw new Error(errorData.error || `Erreur lors du filtrage (${response.status})`);
      }

      const players: Player[] = await response.json();
      console.log('[CLICK] Filtered players received from backend:', players);

      setFilteredPlayers(players);

    } catch (err) {
      console.error('[CLICK] Error during fetch/filter:', err);

      setFilterError(err instanceof Error ? err.message : 'Erreur inconnue lors du filtrage.');
      setFilteredPlayers(null);
    } finally {
      setIsFiltering(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFilteredPlayers(null);
    setCurrentFilterInfo(null);
    setFilterError(null);
    setIsFiltering(false);
    setSearchTerm('');
  };

  const playersToDisplay = filteredPlayers
    ? filteredPlayers.filter(player => {
        const term = searchTerm.toLowerCase();
        return (
          player.name?.toLowerCase().includes(term) ||
          player.team?.toLowerCase().includes(term) ||
          String(player.number).toLowerCase().includes(term) ||
          player.position?.toLowerCase().includes(term) ||
          player.college?.toLowerCase().includes(term)
        );
      })
    : [];

  const getChartType = (target: string): 'bar' | 'doughnut' | 'line' | 'pie' | 'radar' => {
     switch (target) {
       case 'Position': return 'doughnut';
       case 'Salary': return 'bar';
       case 'Age': return 'bar';
       case 'Team': return 'bar';
       default: return 'bar';
     }
   };
  const chartType = getChartType(selectedTarget);

  const chartOptions: ChartOptions<typeof chartType> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    scales: (chartType === 'bar' || chartType === 'line') ? {
      y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
      x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
    } : undefined,
    plugins: {
        legend: { display: true, position: 'top' },
        title: {
            display: true,
            text: `Répartition des Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`,
            padding: { top: 10, bottom: 20 },
            font: { size: 16 }
        },
        tooltip: {
            callbacks: {
              label: function(context) {
                  let label = context.dataset?.label || '';
                  if (label) { label += ': '; }
                  label += context.formattedValue ?? context.parsed?.y ?? context.parsed ?? '';
                  return label;
              }
            }
        }
    }
  };

  const renderChart = () => {
     console.log(`[RENDER] Attempting render. isLoading=${isLoading}, error=${error}, chartData exists=${!!chartData}`);
    if (isLoading || error) return null;

    if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || !chartData.labels ) {
       console.log(`[RENDER] No valid chart data to render for ${selectedTarget}.`);
       return <p style={{textAlign: 'center', marginTop: '50px', fontStyle: 'italic'}}>
                 {chartData?.datasets?.[0]?.label?.includes("Aucune donnée")
                    ? `Aucune donnée trouvée pour ${selectedTarget}.`
                    : `Données non disponibles pour ${selectedTarget}.`
                 }
              </p>;
    }
    
     if (chartData.labels.length === 0 && chartData.datasets[0]?.data.length === 0) {
         console.log(`[RENDER] Rendering message for empty data set: ${chartData.datasets[0]?.label}`);
         return <p style={{textAlign: 'center', marginTop: '50px', fontStyle: 'italic'}}>
                   {chartData.datasets[0]?.label ?? `Aucune donnée pour ${selectedTarget}.`}
                </p>;
     }

    const labelFromState = chartData.datasets[0]?.label;
    console.log(`[RENDER] Rendering ${chartType} chart for ${selectedTarget}. Dataset label: "${labelFromState}"`);
    if (typeof labelFromState !== 'string' || labelFromState === '') {
        console.error(`[RENDER] ****** ATTENTION: Invalid label detected just before rendering! Label:`, labelFromState);
    }

    switch (chartType) {
      case 'bar': return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
      case 'doughnut': return <Doughnut ref={chartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={chartOptions as ChartOptions<'doughnut'>} />;
      case 'line': return <Line ref={chartRef as React.MutableRefObject<ChartJS<'line'> | null>} data={chartData} options={chartOptions as ChartOptions<'line'>} />;
      case 'pie': return <Pie ref={chartRef as React.MutableRefObject<ChartJS<'pie'> | null>} data={chartData} options={chartOptions as ChartOptions<'pie'>} />;
      case 'radar': return <Radar ref={chartRef as React.MutableRefObject<ChartJS<'radar'> | null>} data={chartData} options={chartOptions as ChartOptions<'radar'>} />;
      default:
        console.warn(`[RENDER] Unknown chart type '${chartType}', falling back to 'bar'.`);
        return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
    }
  };

  
  
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <ChartFilterSidebar
        targets={['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary']}
        selectedTarget={selectedTarget}
        onSelectTarget={(target) => { if (!isLoading) setSelectedTarget(target); }}
        isLoading={isLoading}
      />

      <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <h2 style={{textAlign: 'center', marginTop: 0, marginBottom: '20px', flexShrink: 0}}>Statistiques des Joueurs NBA</h2>
        <div style={{ flexGrow: 1, position: 'relative', minHeight: '400px', width: '100%' }}> {/* Hauteur min + width */}
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
          {!isLoading && !error && (
            <div style={{ height: '100%', width: '100%' }}>
              {renderChart()}
            </div>
          )}
        </div>
        

        <TeamsDetailsViewer />
        <TeamsDetailsViewer />

      </div>

      {isModalOpen && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 999 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '85vh', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', flexShrink: 0 }}>
              {currentFilterInfo && (
                <h3 style={{ margin: 0 }}>
                  Joueurs: {currentFilterInfo.property} "{String(currentFilterInfo.label)}"
                </h3>
              )}
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#888', lineHeight: 1, padding: 0 }} aria-label="Fermer">×</button>
            </div>

             
             <input
               type="text"
               placeholder="Filtrer par nom, équipe, n°, position..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ padding: '10px 12px', marginBottom: '15px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box', flexShrink: 0 }}
               disabled={isFiltering || !!filterError}
             />

            
            <div style={{ overflowY: 'auto', flexGrow: 1, minHeight: '100px' }}>
              
              {isFiltering && <p style={{ textAlign: 'center', padding: '30px 0', fontStyle: 'italic', color: '#555' }}>Chargement des joueurs...</p>}
              {filterError && <p style={{ color: '#c62828', textAlign: 'center', padding: '20px', border: '1px solid #e57373', borderRadius: '4px', backgroundColor: '#ffebee' }}>Erreur: {filterError}</p>}
              {!isFiltering && !filterError && (
                <>
                  {filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                    <p style={{ textAlign: 'center', padding: '30px 0', color: '#555' }}>
                      Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'cette tranche de salaire' : `la catégorie "${String(currentFilterInfo.label)}"`}.
                    </p>
                  )}

                  {filteredPlayers && filteredPlayers.length > 0 && playersToDisplay.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '30px 0', fontStyle: 'italic', color: '#777' }}>
                      Aucun joueur ne correspond à votre recherche "{searchTerm}" dans cette sélection.
                    </p>
                  )}

                  {playersToDisplay.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {playersToDisplay.map((player, index) => (
                        <li key={player.id || `${player.name}-${index}`}
                            style={{ padding: '12px 8px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '10px 15px', fontSize: '0.9em', alignItems: 'center' }}>
                          <strong style={{ minWidth: '150px', flexBasis: '150px' }}>{player.name ?? 'N/A'}</strong>
                          <span style={{ color: '#666' }}>{player.team ?? 'N/A'}</span>
                          <span style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{player.position ?? '?'}</span>
                          <span style={{ color: '#888' }}>(#{player.number ?? '?'})</span>
                          <span style={{ marginLeft: 'auto', color: '#333' }}>Age: {player.age ?? '?'}</span>

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
            </div>
            
          </div>
        </>
      )}
      
    </div>
  );
};

export default PlayerChart;
