// components/PlayerChartContainer.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale,
    ChartEvent, ActiveElement
} from 'chart.js';
import { Player, ChartResponseData, ChartStateData, PlayerSortKey, SortOrder } from '../types';
import { generateColors } from '../utils/index';
import ChartFilterSidebar from './ChartFilterSidebar';
import HomeView from './HomeView';
import ChartView from './ChartView';
import FilterModal from './FilterModal';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale
);

const ITEMS_PER_PAGE = 15;
const API_BASE_URL = 'http://localhost:3001/api';

const PlayerChartContainer: React.FC = () => {
    const [selectedTarget, setSelectedTarget] = useState<string>('Home');
    const [chartData, setChartData] = useState<ChartStateData | null>(null);
    const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const chartRef = useRef<ChartJS<'bar' | 'doughnut'> | null>(null);

    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(false);
    const [playersError, setPlayersError] = useState<string | null>(null);
    const [searchTermHome, setSearchTermHome] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [filteredPlayersModal, setFilteredPlayersModal] = useState<Player[] | null>(null);
    const [isFilteringModal, setIsFilteringModal] = useState<boolean>(false);
    const [filterModalError, setFilterModalError] = useState<string | null>(null);
    const [currentFilterInfo, setCurrentFilterInfo] = useState<{ property: string, label: string | number } | null>(null);
    const [searchTermModal, setSearchTermModal] = useState<string>('');

    const [sortKey, setSortKey] = useState<PlayerSortKey | null>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const fetchChartData = useCallback(async (target: string) => {
        if (target === 'Home') return;

        setIsLoadingChart(true);
        setChartError(null);
        setChartData(null);
        console.log(`[FETCH-CHART] Fetching chart stats for: ${target}`);

        try {
            const response = await fetch(`${API_BASE_URL}/players/stats/${target.toLowerCase()}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            const data: ChartResponseData = await response.json();
            console.log(`[FETCH-CHART] Received stats data for ${target}:`, data);

            if (!data || !data.labels || !data.data || !Array.isArray(data.labels) || !Array.isArray(data.data)) {
                throw new Error(`Format de données invalide reçu pour ${target}.`);
            }

            if (data.labels.length === 0) {
                setChartData({
                    labels: [],
                    datasets: [{
                        label: `Aucune donnée agrégée pour ${target}`,
                        data: [], backgroundColor: [], borderColor: [], borderWidth: 1,
                    }]
                });
            } else {
                const numLabels = data.labels.length;
                const backgroundColors = generateColors(numLabels);
                const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));
                const chartLabel = `Nombre de Joueurs par ${target === 'Salary' ? 'Tranche de Salaire' : target}`;
                setChartData({
                    labels: data.labels,
                    datasets: [{
                        label: chartLabel, data: data.data, backgroundColor: backgroundColors,
                        borderColor: borderColors, borderWidth: 1,
                    }],
                });
            }
        } catch (err) {
            console.error(`[FETCH-CHART] Error fetching stats for ${target}:`, err);
            const message = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des stats.';
            setChartError(message);
            setChartData(null);
        } finally {
            setIsLoadingChart(false);
        }
    }, []);

    const fetchAllPlayers = useCallback(async () => {
        setIsLoadingPlayers(true);
        setPlayersError(null);
        setAllPlayers([]);
        console.log(`[FETCH-HOME] Fetching all players...`);

        try {
            const response = await fetch(`${API_BASE_URL}/players/all`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            const data: Player[] = await response.json();
            console.log(`[FETCH-HOME] Received ${data.length} players.`);

            if (!Array.isArray(data)) {
                throw new Error("Format de données invalide reçu pour la liste des joueurs.");
            }
            setAllPlayers(data);
        } catch (err) {
            console.error('[FETCH-HOME] Error fetching all players:', err);
            const message = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement de la liste.';
            setPlayersError(message);
            setAllPlayers([]);
        } finally {
            setIsLoadingPlayers(false);
        }
    }, []);

    const fetchFilteredPlayers = useCallback(async (property: string, value: string | number) => {
        setIsFilteringModal(true);
        setFilterModalError(null);
        setFilteredPlayersModal(null);
        console.log(`[FETCH-FILTER] Fetching filtered players: Property='${property}', Value='${value}'`);

        try {
            const encodedValue = encodeURIComponent(String(value));
            const url = `${API_BASE_URL}/players/filter?property=${property.trim().toLowerCase()}&value=${encodedValue}`;
            console.log(`[FETCH-FILTER] Calling filter API: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }));
                throw new Error(errorData.error || `Erreur lors du filtrage (${response.status})`);
            }
            const players: Player[] = await response.json();
            console.log('[FETCH-FILTER] Filtered players received:', players);
            setFilteredPlayersModal(players);
        } catch (err) {
            console.error('[FETCH-FILTER] Error during fetch/filter:', err);
            const message = err instanceof Error ? err.message : 'Erreur inconnue lors du filtrage.';
            setFilterModalError(message);
            setFilteredPlayersModal(null);
        } finally {
            setIsFilteringModal(false);
        }
    }, []);

    useEffect(() => {
        setChartError(null);
        setPlayersError(null);
        setCurrentPage(1);
        setSearchTermHome('');
        setIsModalOpen(false);
        setSortKey('name');
        setSortOrder('asc');

        if (selectedTarget === 'Home') {
            setChartData(null);
            fetchAllPlayers();
        } else {
            setAllPlayers([]);
            fetchChartData(selectedTarget);
        }
    }, [selectedTarget, fetchAllPlayers, fetchChartData]);

    const handleSelectTarget = (target: string) => {
        setSelectedTarget(target);
    };

    const handleSearchHomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermHome(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
        console.log(event);
        
        if (elements.length === 0 || !chartData || !chartData.labels || chartData.labels.length === 0) {
            return;
        }
        const elementIndex = elements[0].index;
        if (elementIndex < 0 || elementIndex >= chartData.labels.length) {
            return;
        }
        const clickedLabel = chartData.labels[elementIndex];
        const filterProperty = selectedTarget;
        const valueToSend = clickedLabel;

        setCurrentFilterInfo({ property: filterProperty, label: valueToSend });
        setSearchTermModal('');
        setIsModalOpen(true);
        fetchFilteredPlayers(filterProperty, valueToSend);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSearchModalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermModal(event.target.value);
    };

    const handleSort = useCallback((key: PlayerSortKey) => {
        setSortOrder(prevOrder => (key === sortKey && prevOrder === 'asc' ? 'desc' : 'asc'));
        setSortKey(key);
        setCurrentPage(1);
    }, [sortKey]);

    const parseHeight = (heightStr: string | undefined | null): number => {
         if (!heightStr || !/^\d+-\d+$/.test(heightStr)) return -1;
         const [feet, inches] = heightStr.split('-').map(Number);
         return (feet * 12) + inches;
    };

    const comparePlayers = useCallback((a: Player, b: Player, key: PlayerSortKey | null, order: SortOrder): number => {
        if (!key) return 0;

        let valA = a[key];
        let valB = b[key];

        if (key === 'height') {
            valA = parseHeight(valA as string | null);
            valB = parseHeight(valB as string | null);
        }

        const aIsNull = valA === null || valA === undefined || valA === '';
        const bIsNull = valB === null || valB === undefined || valB === '';

        if (aIsNull && bIsNull) return 0;
        if (aIsNull) return order === 'asc' ? 1 : -1;
        if (bIsNull) return order === 'asc' ? -1 : 1;

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
             comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        } else if (typeof valA === 'number' && typeof valB === 'number') {
             comparison = valA - valB;
        } else {
             const strA = String(valA);
             const strB = String(valB);
             comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
        }

        return order === 'asc' ? comparison : comparison * -1;

    }, []);

    const sortedPlayers = useMemo(() => {
        console.log(`[MEMO] Sorting ${allPlayers.length} players by ${sortKey || 'none'} (${sortOrder})`);
        if (!sortKey) return [...allPlayers];
        return [...allPlayers].sort((a, b) => comparePlayers(a, b, sortKey, sortOrder));
    }, [allPlayers, sortKey, sortOrder, comparePlayers]);

    const filteredAndSortedPlayersHome = useMemo(() => {
        console.log(`[MEMO] Filtering ${sortedPlayers.length} players with term: "${searchTermHome}"`);
        return sortedPlayers.filter(player => {
            const term = searchTermHome.trim().toLowerCase();
            if (!term) return true;
            return (
                player.name?.toLowerCase().includes(term) ||
                player.team?.toLowerCase().includes(term) ||
                player.position?.toLowerCase().includes(term) ||
                String(player.age ?? '').includes(term) ||
                String(player.number ?? '').toLowerCase().includes(term)
            );
        });
    }, [sortedPlayers, searchTermHome]);

    const totalPages = useMemo(() => {
         const pages = Math.ceil(filteredAndSortedPlayersHome.length / ITEMS_PER_PAGE);
         console.log(`[MEMO] Calculating total pages: ${pages} for ${filteredAndSortedPlayersHome.length} players`);
         return pages;
    }, [filteredAndSortedPlayersHome.length]);

    const paginatedPlayersHome = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        console.log(`[MEMO] Paginating players: Page ${currentPage}, Indices ${startIndex}-${endIndex-1}`);
        return filteredAndSortedPlayersHome.slice(startIndex, endIndex);
    }, [filteredAndSortedPlayersHome, currentPage]);


    return (
        <div className="flex h-screen font-sans overflow-hidden bg-gray-100">
            <ChartFilterSidebar
                targets={['Home', 'Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight', 'Salary']}
                selectedTarget={selectedTarget}
                onSelectTarget={handleSelectTarget}
                isLoading={false}
            />

            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                <h2 className="text-3xl font-bold text-blue-600 text-center mt-0 mb-5 flex-shrink-0">
                    {selectedTarget === 'Home' ? 'Liste des Joueurs NBA' : `Statistiques des Joueurs NBA (${selectedTarget})`}
                </h2>

                <div className="flex-grow">
                    {selectedTarget === 'Home' ? (
                        <HomeView
                            isLoading={isLoadingPlayers}
                            error={playersError}
                            players={paginatedPlayersHome}
                            searchTerm={searchTermHome}
                            onSearchChange={handleSearchHomeChange}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            sortKey={sortKey}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                        />
                    ) : (
                        <ChartView
                            isLoading={isLoadingChart}
                            error={chartError}
                            chartData={chartData}
                            selectedTarget={selectedTarget}
                            onChartClick={handleChartClick}
                            chartRef={chartRef}
                        />
                    )}
                </div>
            </div>

            <FilterModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                filterInfo={currentFilterInfo}
                isFiltering={isFilteringModal}
                filterError={filterModalError}
                filteredPlayers={filteredPlayersModal}
                searchTerm={searchTermModal}
                onSearchChange={handleSearchModalChange}
            />
        </div>
    );
};

export default PlayerChartContainer;