import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

type TeamStats = {
  teamName: string;
  labels: string[];
  playerCounts: number[];
  averageSalaries: (number | null)[];
  averageAges: (number | null)[];
};

const TeamDetailsViewer: React.FC = () => {
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [data, setData] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les équipes
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams/list');
      setTeams(response.data);
      if (response.data.length > 0) {
        setSelectedTeam(response.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des équipes.");
    }
  };

  // Fonction pour récupérer les statistiques d'une équipe
  const fetchData = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/teams/details/${encodeURIComponent(selectedTeam)}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des équipes
  useEffect(() => {
    fetchTeams();
  }, []);

  // Chargement des données pour l'équipe sélectionnée
  useEffect(() => {
    fetchData();
  }, [selectedTeam]);

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h2>Visualisation des Détails d'une Équipe</h2>

      <label htmlFor="team-select" style={{fontWeight: "bold", fontSize: "18px"}}>Sélectionnez une équipe :</label>
      <select
        id="team-select"
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        style={{ backgroundColor: "white", margin: '0.5rem 0', padding: '0.3rem' }}
      >
        {teams.length > 0 ? (
          teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))
        ) : (
          <option disabled>Chargement des équipes...</option>
        )}
      </select>

      {loading && <p>Chargement des données...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h3>Détails pour l'équipe: {data.teamName}</h3>

          <div style={{ marginBottom: '2rem' }}>
            <h4>Nombre de joueurs par position</h4>
            <Bar
              data={{
                labels: data.labels,
                datasets: [{
                  label: 'Nombre de joueurs',
                  data: data.playerCounts,
                  backgroundColor: '#4CAF50',
                }],
              }}
              options={commonOptions}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4>Salaire moyen par position ($)</h4>
            <Bar
              data={{
                labels: data.labels,
                datasets: [{
                  label: 'Salaire moyen',
                  data: data.averageSalaries,
                  backgroundColor: '#2196F3',
                }],
              }}
              options={commonOptions}
            />
          </div>

          <div>
            <h4>Âge moyen par position</h4>
            <Bar
              data={{
                labels: data.labels,
                datasets: [{
                  label: 'Âge moyen',
                  data: data.averageAges,
                  backgroundColor: '#FF9800',
                }],
              }}
              options={commonOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailsViewer;
