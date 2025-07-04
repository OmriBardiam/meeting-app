import { useState, useEffect } from 'react'
import TeamSelection from './TeamSelection'
import Dashboard from './Dashboard'
import Settings from './Settings'
import { API_BASE, APP_NAME } from './config'
import './App.css'

// Debug logging
console.log('Current hostname:', window.location.hostname);
console.log('API Base URL:', API_BASE);

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(() => localStorage.getItem('selectedPlayer') || null);
  const [selectedTeam, setSelectedTeam] = useState(() => localStorage.getItem('selectedTeam') || null);
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('adminPassword') || '');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === '1');
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'settings'

  async function fetchGameState() {
    try {
      console.log('Fetching game state from:', `${API_BASE}/state`);
      const response = await fetch(`${API_BASE}/state`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Game state received:', data);
        setGameState(data);
      } else {
        console.error('Failed to fetch game state. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
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

  useEffect(() => {
    localStorage.setItem('selectedTeam', selectedTeam || '');
  }, [selectedTeam]);

  useEffect(() => {
    localStorage.setItem('adminPassword', adminPassword || '');
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin ? '1' : '0');
  }, [isAdmin]);

  function handlePlayerSelect(name, isAdminFlag) {
    setSelectedPlayer(name);
    setIsAdmin(isAdminFlag);
    setCurrentView('dashboard');
    setLoading(true);
    fetchGameState();
  }

  function handleLogout() {
    setSelectedPlayer(null);
    setSelectedTeam(null);
    setAdminPassword('');
    setIsAdmin(false);
    setCurrentView('dashboard');
    localStorage.removeItem('selectedPlayer');
    localStorage.removeItem('selectedTeam');
    localStorage.removeItem('teamPassword');
    localStorage.removeItem('adminPassword');
    localStorage.removeItem('isAdmin');
  }

  function handleChangeUser() {
    console.log('App: handleChangeUser called');
    console.log('App: Current selectedPlayer:', selectedPlayer);
    console.log('App: Current selectedTeam:', selectedTeam);
    setSelectedPlayer(null);
    setAdminPassword('');
    // Keep the team selected so user goes back to user selection screen
    // The TeamSelection component will automatically detect the saved team and go to user selection
  }

  function handleOpenSettings() {
    setCurrentView('settings');
  }

  function handleBackToDashboard() {
    setCurrentView('dashboard');
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

  console.log('App: Current state - selectedPlayer:', selectedPlayer, 'selectedTeam:', selectedTeam, 'loading:', loading, 'gameState:', !!gameState);

  if (loading || !gameState) {
    console.log('App: Showing loading screen');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        Loading Drunksters...
      </div>
    );
  }

  if (!selectedPlayer) {
    console.log('App: Showing TeamSelection');
    return <TeamSelection onSelectPlayer={handlePlayerSelect} />
  }

  if (currentView === 'settings') {
    console.log('App: Showing Settings');
    return (
      <Settings 
        player={selectedPlayer}
        gameState={gameState}
        onBack={handleBackToDashboard}
        onUpdateGameState={fetchGameState}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        isAdmin={isAdmin}
      />
    );
  }

  console.log('App: Showing Dashboard');
  return (
    <div className="App">
      <Dashboard 
        player={selectedPlayer} 
        gameState={gameState} 
        onLogout={handleLogout} 
        onScoreUpdate={fetchGameState}
        onOpenSettings={handleOpenSettings}
        onChangeUser={handleChangeUser}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default App
