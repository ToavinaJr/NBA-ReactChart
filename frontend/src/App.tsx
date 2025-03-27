import React from 'react';
import PlayerChart from './components/PlayerChart';

const App: React.FC = () => {
  return (
    <div>
      <h1>NBA Players Statistics</h1>
      <PlayerChart />
    </div>
  );
};

export default App;