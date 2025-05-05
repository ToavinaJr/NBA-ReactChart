import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement, ChartOptions
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Player, ChartResponseData, ChartStateData } from '../types';
import { generateColors , getChartType } from '../utils/index.ts'
import ChartFilterSidebar from './ChartFilterSidebar'; 
import TeamsDetailsViewer from './TeamsDetailsViewer'
import PlayerTable from './PlayerTable';             
import { PaginationControls } from './PaginationControls';
import DataDescription from './DataDescription'

const ITEMS_PER_PAGE = 15;
const BASE_API = 'http://localhost:3001/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);


const PlayerChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartStateData | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<string>('Home');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[] | null>(null);
    const [isFiltering, setIsFiltering] = useState<boolean>(false);
    const [filterError, setFilterError] = useState<string | null>(null);
    const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [searchTermModal, setSearchTermModal] = useState<string>('');
    const chartRef = useRef<ChartJS<'bar' | 'doughnut' | 'line' | 'pie' | 'radar'>>(null);

    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [isAllPlayersLoading, setIsAllPlayersLoading] = useState<boolean>(false);
    const [allPlayersError, setAllPlayersError] = useState<string | null>(null);
    const [searchTermHome, setSearchTermHome] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);


    const fetchChartData = useCallback(async (target: string) => {
        setIsLoading(true);
        setError(null);
        setAllPlayers([]);
        setChartData(null);

        console.log(`[EFFECT-CHART] Fetching chart stats for: ${target}`);

        try {
            if (target === 'Home') {
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${BASE_API}/players/stats/${target.toLowerCase()}`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            const data: ChartResponseData = await response.json();
            console.log(`[EFFECT-CHART] Received stats data for ${target}:`, data);

            if (!data || !data.labels || !data.data || !Array.isArray(data.labels) || !Array.isArray(data.data)) {
                console.warn(`[EFFECT-CHART] Invalid stats data format for ${target}`, data);
                setError(`Format de données invalide reçu pour ${selectedTarget}.`);
                setChartData(null);
                return;
            }

            if (data.labels.length === 0) {
                console.warn(`[EFFECT-CHART] No aggregated data found for ${target}`);
                setChartData({
                    labels: [],
                    datasets: [{
                        label: `Aucune donnée agrégée pour ${selectedTarget}`,
                        data: [],
                        backgroundColor: [], borderColor: [], borderWidth: 1,
                    }]
                });
            
            } else {
                const numLabels = data.labels.length;
                const backgroundColors = generateColors(numLabels);
                const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));
                const chartLabel = `Nombre de Joueurs par ${selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget}`;
                console.log(`[EFFECT-CHART] Generated chartLabel for ${selectedTarget}: "${chartLabel}"`);
                setChartData({
                    labels: data.labels,
                    datasets: [{
                        label: chartLabel,
                        data: data.data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1,
                    }],
                });
            }

        } catch (err) {
            console.error(`[EFFECT-CHART] Error fetching stats for ${target}:`, err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des stats.');
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
     }, [selectedTarget]);


    const fetchAllPlayers = useCallback(async () => {
        setIsAllPlayersLoading(true);
        setAllPlayersError(null);
        setAllPlayers([]);

        console.log(`[EFFECT-HOME] Fetching all players...`);

        try {
            const response = await fetch(`http://localhost:3001/api/players/all`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            const data: Player[] = await response.json();
            console.log(`[EFFECT-HOME] Received ${data.length} players.`);

            if (!Array.isArray(data)) {
                 console.warn(`[EFFECT-HOME] Invalid player data format received`, data);
                 throw new Error("Format de données invalide reçu pour la liste des joueurs.");
            }
            setAllPlayers(data);

        } catch (err) {
            console.error('[EFFECT-HOME] Error fetching all players:', err);
            setAllPlayersError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement de la liste.');
            setAllPlayers([]);
        } finally {
            setIsAllPlayersLoading(false);
        }
    }, []);


    useEffect(() => {
        setError(null);
        setAllPlayersError(null);
        setCurrentPage(1);
        setSearchTermHome('');
        setFilteredPlayers(null);
        setIsModalOpen(false);
        setCurrentFilterInfo(null);


        if (selectedTarget === 'Home') {
            setIsLoading(true);
            setChartData(null);
            fetchAllPlayers().finally(() => setIsLoading(false));
        } else {
            setIsAllPlayersLoading(true);
            setAllPlayers([]);
            setIsAllPlayersLoading(false);
            fetchChartData(selectedTarget);
        }
    }, [selectedTarget, fetchAllPlayers, fetchChartData]);


    const filteredAndSearchedPlayers = allPlayers.filter(player => {
        // ... (logique inchangée) ...
        const term = searchTermHome.trim().toLowerCase();
        if (!term) return true;
        return (
            player.name?.toLowerCase().includes(term) ||
            player.team?.toLowerCase().includes(term) ||
            player.position?.toLowerCase().includes(term) ||
            String(player.age).includes(term) ||
            String(player.number).toLowerCase().includes(term)
        );
    });

    const totalPages = Math.ceil(filteredAndSearchedPlayers.length / ITEMS_PER_PAGE);

    const paginatedPlayers = filteredAndSearchedPlayers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermHome(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleChartClick = async (event: ChartEvent, elements: ActiveElement[]) => {
        console.log(event);

         if (selectedTarget === 'Home' || elements.length === 0 || !chartData || !chartData.labels || chartData.labels.length === 0) {
            console.log("[CLICK] Ignored: Not on chart view or no clickable element/data.");
            return;
        }

        const elementIndex = elements[0].index;
        if (elementIndex < 0 || elementIndex >= chartData.labels.length) {
            console.warn("[CLICK] Invalid click index:", elementIndex);
            return;
        }

        const clickedLabel = chartData.labels[elementIndex];
        const filterProperty = selectedTarget;
        const valueToSend = clickedLabel;

        console.log(`[CLICK] Chart segment clicked: Property='${filterProperty}', Value='${valueToSend}'`);

        setIsFiltering(true);
        setFilterError(null);
        setFilteredPlayers(null);
        setSearchTermModal('');
        setCurrentFilterInfo({ property: filterProperty, label: valueToSend });
        setIsModalOpen(true);

        try {
            const encodedValue = encodeURIComponent(String(valueToSend));
            const url = `${BASE_API}/players/filter?property=${filterProperty.trim().toLowerCase()}&value=${encodedValue}`;

            console.log(`[CLICK] Calling filter API: ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }));
                throw new Error(errorData.error || `Erreur lors du filtrage (${response.status})`);
            }

            const players: Player[] = await response.json();
            console.log('[CLICK] Filtered players received:', players);
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
        setSearchTermModal('');
    };

     const playersToDisplayInModal = filteredPlayers
       ? filteredPlayers.filter(player => {
           // ... (logique inchangée) ...
           const term = searchTermModal.trim().toLowerCase();
           return (
             player.name?.toLowerCase().includes(term) ||
             player.team?.toLowerCase().includes(term) ||
             String(player.number).toLowerCase().includes(term) ||
             player.position?.toLowerCase().includes(term) ||
             player.college?.toLowerCase().includes(term)
           );
         })
       : [];

     const renderChart = () => {
        if (selectedTarget === 'Home') return null;

        console.log(`[RENDER-CHART] Attempting render. isLoading=${isLoading}, error=${error}, chartData exists=${!!chartData}`);

        // Simplification : Ne pas rendre si chargement ou erreur
        if (isLoading || error) return null; // Les messages sont gérés ailleurs

        if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || !chartData.labels) {
            console.log(`[RENDER-CHART] No valid chart data to render for ${selectedTarget}.`);
            // Message géré par le bloc plus bas si chartData est vide
            return <p className="text-center mt-[50px] italic text-gray-600">
                       Données non disponibles ou invalides pour {selectedTarget}.
                   </p>;
        }

        if (chartData.labels.length === 0 && chartData.datasets[0]?.data.length === 0) {
             console.log(`[RENDER-CHART] Rendering message for empty data set: ${chartData.datasets[0]?.label}`);
            return <p className="text-center mt-[50px] italic text-gray-600">
                      {chartData.datasets[0]?.label ?? `Aucune donnée pour ${selectedTarget}.`}
                   </p>;
        }


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
                    callbacks: { label: (context) => `${context.dataset.label || ''}: ${context.formattedValue}` }
                }
            }
        };


        console.log(`[RENDER-CHART] Rendering ${chartType} chart for ${selectedTarget}.`);
        switch (chartType) {
          case 'bar': return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
          case 'doughnut': return <Doughnut ref={chartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={chartOptions as ChartOptions<'doughnut'>} />;
          default: return <Bar ref={chartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
        }
     };


    return (
        <div className="flex h-screen font-sans overflow-hidden bg-gray-100">
            <ChartFilterSidebar
                targets={['Home', 'Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary']}
                selectedTarget={selectedTarget}
                onSelectTarget={(target) => { setSelectedTarget(target); }}
                isLoading={false}
            />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                <h2 className="text-3xl font-bold text-blue-600 text-center mt-0 mb-5 flex-shrink-0">
                    {selectedTarget === 'Home' ? 'Liste des Joueurs NBA' : `Statistiques des Joueurs NBA (${selectedTarget})`}
                </h2>
                <div className="flex-grow">
                    {selectedTarget === 'Home' && (
                        <>
                            {isAllPlayersLoading && (
                                <p className="text-center italic text-gray-500 py-10">
                                    Chargement de la liste des joueurs...
                                </p>
                            )}
                            {allPlayersError && (
                                <div className="p-5 mb-5 border border-red-400 rounded bg-red-100 text-red-800 text-center">
                                    <strong>Erreur lors du chargement :</strong><br />{allPlayersError}
                                </div>
                            )}
                            {!isAllPlayersLoading && !allPlayersError && (
                                <>
                                    <DataDescription />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom, équipe, position, âge, numéro..."
                                        value={searchTermHome}
                                        onChange={handleSearchChange}
                                        className="px-3 py-2.5 mb-4 text-base border border-gray-300 rounded w-full box-border focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                    />
                                    {/* Tableau des joueurs */}
                                    <PlayerTable 
                                        players={paginatedPlayers} 
                                        sortKey={null} 
                                        sortOrder={'asc'} 
                                        onSort={(key) => console.log(`Sorting by ${key}`)} 
                                    />

                                    {/* Contrôles de pagination */}
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {selectedTarget !== 'Home' && (
                        <div className="relative w-full min-h-[400px]">
                            {isLoading && (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-lg text-gray-500">Chargement des données du graphique...</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-5 m-5 border border-red-400 rounded bg-red-100 text-red-800 text-center">
                                    <strong>Erreur lors du chargement :</strong><br />{error}
                                </div>
                            )}
                        
                            {!isLoading && !error && (
                                <div className="h-full w-full min-h-[350px] mb-8"> 
                                    {renderChart()}
                                </div>
                            )}

                        
                            <TeamsDetailsViewer />
                            <TeamsDetailsViewer />
                            
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modal Filtre --- */}
            {isModalOpen && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={closeModal}
                        className="fixed inset-0 bg-black/70 z-[999]" 
                     />
                    {/* Contenu Modal */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl max-h-[85vh] bg-white p-5 rounded-lg shadow-xl z-[1000] flex flex-col">
                        {/* Header Modal */}
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 mb-4 flex-shrink-0">
                            {currentFilterInfo && (
                                <h3 className="text-lg font-semibold text-gray-800 m-0">
                                    Joueurs - {currentFilterInfo.property}: "{String(currentFilterInfo.label)}"
                                </h3>
                            )}
                            <button
                                onClick={closeModal}
                                className="bg-transparent border-none text-3xl cursor-pointer text-gray-500 hover:text-gray-800 leading-none p-0 focus:outline-none"
                                aria-label="Fermer"
                            >
                                ×
                            </button>
                        </div>

                        {/* Filtre dans la Modal */}
                        <input
                            type="text"
                            placeholder="Filtrer dans cette sélection..."
                            value={searchTermModal}
                            onChange={(e) => setSearchTermModal(e.target.value)}
                            className="px-3 py-2.5 mb-4 text-base border border-gray-300 rounded w-full box-border flex-shrink-0 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none disabled:bg-gray-100"
                            disabled={isFiltering || !!filterError}
                        />

                        {/* Corps scrollable de la Modal */}
                        <div className="overflow-y-auto flex-grow min-h-[100px]">
                            {/* Chargement/Erreur dans la Modal */}
                            {isFiltering && <p className="text-center py-8 italic text-gray-500">Chargement des joueurs...</p>}
                            {filterError && <p className="text-red-800 text-center p-5 border border-red-300 rounded bg-red-100">Erreur: {filterError}</p>}

                            {/* Liste des joueurs dans la Modal */}
                            {!isFiltering && !filterError && (
                                <>
                                    {/* Message si aucun joueur pour le filtre initial */}
                                    {filteredPlayers && filteredPlayers.length === 0 && currentFilterInfo && (
                                        <p className="text-center py-8 text-gray-500">
                                            Aucun joueur trouvé pour {currentFilterInfo.property === 'Salary' ? 'cette tranche de salaire' : `la catégorie "${String(currentFilterInfo.label)}"`}.
                                        </p>
                                    )}
                                    {/* Message si aucun joueur après filtre de recherche modal */}
                                    {filteredPlayers && filteredPlayers.length > 0 && playersToDisplayInModal.length === 0 && (
                                         <p className="text-center py-8 italic text-gray-700">
                                             Aucun joueur ne correspond à votre recherche "{searchTermModal}" dans cette sélection.
                                         </p>
                                    )}
                                    {/* Liste des joueurs filtrés */}
                                    {playersToDisplayInModal.length > 0 && (
                                         <ul className="list-none p-0 m-0">
                                             {playersToDisplayInModal.map((player, index) => (
                                                 <li key={player.id || `${player.name}-${index}`}
                                                     className="py-3 px-2 border-b border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-sm items-center last:border-b-0 hover:bg-gray-50"
                                                 >
                                                      <strong className="min-w-[150px] basis-[150px] text-gray-800">{player.name ?? 'N/A'}</strong>
                                                      <span className="text-gray-600">{player.team ?? 'N/A'}</span>
                                                      <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{player.position ?? '?'}</span>
                                                      <span className="text-gray-500">(#{player.number ?? '?'})</span>
                                                      <span className="ml-auto text-gray-700">Age: {player.age ?? '?'}</span>
                                                      {player.height && <span className="text-gray-600">Ht: {player.height}</span>}
                                                      {player.weight && <span className="text-gray-600">Wt: {player.weight}kg</span>}
                                                      {player.college && <span className="text-xs text-gray-500 basis-full text-left">Collège: {player.college}</span>}
                                                      {player.salary !== null && player.salary !== undefined && (
                                                        <span className="font-bold text-blue-600 basis-full text-right">
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