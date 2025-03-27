import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement, LineElement, PointElement, RadarController, RadialLinearScale);

// Interface pour les données des joueurs
interface Player {
  name: string;
  team: string;
  number: number;
  position: string;
  age: number;
  height: string;
  weight: number;
  college: string;
  salary: number | null;
}

const PlayerChart: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('Age');

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/players');
        const data = await response.json();
        console.log('Données récupérées :', data);
        setPlayers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };
    fetchData();
  }, []);

  // Fonction pour obtenir les valeurs uniques d'une propriété
  const list = (target: string): string[] => {
    const values = Array.from(new Set(players.map((player: any) => player[target.toLowerCase()])));
    console.log(`Valeurs uniques pour ${target} :`, values);
    return values;
  };

  // Fonction pour compter les occurrences de chaque valeur
  const numberPossibilityPer = (target: string): number[] => {
    const uniqueValues = list(target);
    const counts = uniqueValues.map((value) =>
      players.reduce((count, player: any) => {
        return player[target.toLowerCase()] === value ? count + 1 : count;
      }, 0)
    );
    console.log(`Occurrences pour ${target} :`, counts);
    return counts;
  };

  // Déterminer le type de graphique en fonction de la propriété
  const getChartType = (target: string): string => {
    switch (target) {
      case 'Age':
        return 'bar';
      case 'Position':
        return 'doughnut';
      case 'Team':
        return 'line';
      case 'College':
        return 'pie';
      case 'Height':
        return 'radar';
      case 'Number':
        return 'radar';
      case 'Weight':
        return 'line';
      default:
        return 'bar';
    }
  };

  // Préparer les données pour le graphique
  const xData = list(selectedTarget);
  const yData = numberPossibilityPer(selectedTarget);
  const chartType = getChartType(selectedTarget);

  console.log('xData :', xData);
  console.log('yData :', yData);
  console.log('Type de graphique :', chartType);

  const chartData = {
    labels: xData,
    datasets: [
      {
        label: 'Number of Players',
        data: yData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options pour le graphique
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Distribution of Players by ${selectedTarget}`,
      },
    },
  };

  // Fonction pour rendre le graphique
  const renderChart = () => {
    console.log('Rendu du graphique avec type :', chartType);
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Menu à gauche */}
      <div style={{ width: '200px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h3>Filters</h3>
        {['Age', 'Position', 'Team', 'College', 'Height', 'Number', 'Weight'].map((target) => (
          <button
            key={target}
            className="btn w-[150px]"
            onClick={() => setSelectedTarget(target)}
            style={{
              display: 'block',
              margin: '10px 0',
              padding: '10px',
              backgroundColor: selectedTarget === target ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {target}
          </button>
        ))}
      </div>

      {/* Zone de droite pour le graphique */}
      <div id="right" style={{ flex: 1, padding: '20px' }}>
        {players.length > 0 ? (
          renderChart()
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerChart;