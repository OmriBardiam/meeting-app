import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from './config';
import { getTeamByPlayer } from './utils';

const GameContext = createContext();

export function GameProvider({ children }) {
  // Teams, settings, and login state
  const [teams, setTeams] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(() => localStorage.getItem('selectedTeam') || null);
  const [selectedPlayer, setSelectedPlayer] = useState(() => localStorage.getItem('selectedPlayer') || null);
  const [teamPassword, setTeamPassword] = useState(() => localStorage.getItem('teamPassword') || '');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === '1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load teams and settings from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
          const data = await response.json();
          setTeams(Object.entries(data.teams).map(([name, team]) => ({ name, ...team })));
          setSettings(data.settings || {});
        }
      } catch (e) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Persist login state
  useEffect(() => {
    localStorage.setItem('selectedTeam', selectedTeam || '');
    localStorage.setItem('selectedPlayer', selectedPlayer || '');
    localStorage.setItem('teamPassword', teamPassword || '');
    localStorage.setItem('isAdmin', isAdmin ? '1' : '0');
  }, [selectedTeam, selectedPlayer, teamPassword, isAdmin]);

  // Login logic
  function login(teamName, password) {
    const team = teams.find(t => t.name === teamName);
    if (!team) return false;
    const isAdminLogin = password === team.adminPassword || password === settings.masterPassword;
    const isValidPassword = password === team.password || isAdminLogin;
    if (isValidPassword) {
      setSelectedTeam(teamName);
      setTeamPassword(password);
      setIsAdmin(isAdminLogin);
      return true;
    }
    return false;
  }

  function logout() {
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setTeamPassword('');
    setIsAdmin(false);
    localStorage.removeItem('selectedTeam');
    localStorage.removeItem('selectedPlayer');
    localStorage.removeItem('teamPassword');
    localStorage.removeItem('isAdmin');
  }

  return (
    <GameContext.Provider value={{
      teams, settings, selectedTeam, setSelectedTeam, selectedPlayer, setSelectedPlayer,
      teamPassword, isAdmin, loading, error, login, logout, getTeamByPlayer
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
} 