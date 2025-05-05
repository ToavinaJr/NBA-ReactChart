import React from 'react';
import { Chart as ChartJS, ChartOptions, ActiveElement, ChartEvent } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ChartStateData } from '../types';
import { getChartType } from '../utils/index'; // Assurez-vous que le chemin est correct

interface DynamicChartProps {
    chartData: ChartStateData;
    selectedTarget: string;
    onChartClick: (event: ChartEvent, elements: ActiveElement[]) => void;
    chartRef: React.MutableRefObject<ChartJS<'bar' | 'doughnut'> | null>; // Type plus précis
}

const DynamicChart: React.FC<DynamicChartProps> = ({ chartData, selectedTarget, onChartClick, chartRef }) => {
    const chartType = getChartType(selectedTarget);

    const chartOptions: ChartOptions<typeof chartType> = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: onChartClick,
        scales: (chartType === 'bar' /* || chartType === 'line' */) ? { // Ajoutez 'line' si vous l'utilisez
            y: { beginAtZero: true, title: { display: true, text: 'Nombre de Joueurs' } },
            x: { title: { display: true, text: selectedTarget === 'Salary' ? 'Tranche de Salaire' : selectedTarget } }
        } : undefined,
        plugins: {
            legend: { display: true, position: 'top' as const }, // Utilisation de 'as const' pour type strict
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

    // Cast explicite pour le ref en fonction du type
    const specificChartRef = chartRef as React.MutableRefObject<ChartJS<typeof chartType> | null>;

    switch (chartType) {
        case 'bar':
            return <Bar ref={specificChartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
        case 'doughnut':
            return <Doughnut ref={specificChartRef as React.MutableRefObject<ChartJS<'doughnut'> | null>} data={chartData} options={chartOptions as ChartOptions<'doughnut'>} />;
        // Ajoutez d'autres types si nécessaire ('line', 'pie', 'radar')
        default: // Par défaut, Bar chart
             return <Bar ref={specificChartRef as React.MutableRefObject<ChartJS<'bar'> | null>} data={chartData} options={chartOptions as ChartOptions<'bar'>} />;
    }
};

export default DynamicChart;