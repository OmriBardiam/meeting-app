import { useState, useEffect } from 'react'
import PlayerSelection from './PlayerSelection'
import Dashboard from './Dashboard'
import './App.css'

// Better API base URL handling
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://meeting-app-backend-hh3f.onrender.com'
    : 'https://meeting-app-backend-hh3f.onrender.com');

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(() => localStorage.getItem('selectedPlayer') || null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchGameState() {
    try {
      const response = await fetch(`${API_BASE}/state`);
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        console.error('Failed to fetch game state');
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGameState();
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    if (!selectedPlayer) return;
    const interval = setInterval(() => {
      fetchGameState();
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedPlayer]);

  useEffect(() => {
    localStorage.setItem('selectedPlayer', selectedPlayer || '');
  }, [selectedPlayer]);

  function handlePlayerSelect(name) {
    setSelectedPlayer(name);
    setLoading(true);
    fetchGameState();
  }

  function handleLogout() {
    setSelectedPlayer(null);
    localStorage.removeItem('selectedPlayer');
  }

  // Get team color for navigation
  const getTeamByPlayer = (player, teams) => {
    for (const [teamName, team] of Object.entries(teams)) {
      if (team.members.includes(player)) {
        return team.color;
      }
    }
    return '#666';
  };
  const teamColor = selectedPlayer && gameState ? getTeamByPlayer(selectedPlayer, gameState.teams) : '#666';

  if (loading || !gameState) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!selectedPlayer) {
    return <PlayerSelection onSelectPlayer={handlePlayerSelect} />
  }

  return (
    <div>
      <Dashboard 
        player={selectedPlayer} 
        gameState={gameState} 
        onLogout={handleLogout} 
        onScoreUpdate={fetchGameState} 
      />
    </div>
  );
}

export default App
