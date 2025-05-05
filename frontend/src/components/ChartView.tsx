import React from 'react';
import { Chart as ChartJS, ActiveElement, ChartEvent } from 'chart.js';
import { ChartStateData } from '../types';
import TeamsDetailsViewer from './TeamsDetailsViewer';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import DynamicChart from './DynamicChart';

interface ChartViewProps {
    isLoading: boolean;
    error: string | null;
    chartData: ChartStateData | null;
    selectedTarget: string;
    onChartClick: (event: ChartEvent, elements: ActiveElement[]) => void;
    chartRef: React.MutableRefObject<ChartJS<'bar' | 'doughnut'> | null>; // Ajusté pour correspondre
}

const ChartView: React.FC<ChartViewProps> = ({
    isLoading,
    error,
    chartData,
    selectedTarget,
    onChartClick,
    chartRef
}) => {

    const renderContent = () => {
        if (isLoading) {
            return <LoadingIndicator message="Chargement des données du graphique..." />;
        }
        if (error) {
            return <ErrorMessage title="Erreur lors du chargement" message={error} />;
        }
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || !chartData.labels) {
             return <p className="text-center mt-[50px] italic text-gray-600">Données non disponibles ou invalides pour {selectedTarget}.</p>;
        }
        if (chartData.labels.length === 0 && chartData.datasets[0]?.data.length === 0) {
             return <p className="text-center mt-[50px] italic text-gray-600">{chartData.datasets[0]?.label ?? `Aucune donnée pour ${selectedTarget}.`}</p>;
        }

        return (
            <div className="h-full w-full min-h-[350px] mb-8">
                <DynamicChart
                    chartData={chartData}
                    selectedTarget={selectedTarget}
                    onChartClick={onChartClick}
                    chartRef={chartRef}
                />
            </div>
        );
    };

    return (
        <div className="relative w-full min-h-[400px]">
             {renderContent()}
             {!isLoading && !error && (
                 <>
                    <TeamsDetailsViewer />
                    <TeamsDetailsViewer />
                 </>
             )}
        </div>
    );
};

export default ChartView;