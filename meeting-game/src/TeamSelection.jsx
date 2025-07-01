import React, { useState, useEffect } from 'react';
import { API_BASE, getPlayerAvatar } from './config';
import './TeamSelection.css';

export default function TeamSelection({ onSelectPlayer }) {
  const [teams, setTeams] = useState([]);
  const [masterPassword, setMasterPassword] = useState("admin2024");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPassword, setTeamPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('team'); // 'team', 'password', 'user'
  const [isAdmin, setIsAdmin] = useState(false);

  // Load teams and master password from backend
  useEffect(() => {
    async function loadTeams() {
      try {
        console.log('TeamSelection: Loading teams from backend...');
        const response = await fetch(`${API_BASE}/settings`);
        console.log('TeamSelection: Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('TeamSelection: Received data:', data);
          const teamsArray = Object.entries(data.teams).map(([name, team]) => ({
            name,
            ...team
          }));
          setTeams(teamsArray);
          setMasterPassword(data.settings?.masterPassword || "admin2024");
          
          // Check for saved team login
          const savedTeam = localStorage.getItem('selectedTeam');
          const savedPassword = localStorage.getItem('teamPassword');
          console.log('TeamSelection: Saved team:', savedTeam, 'Saved password:', savedPassword);
          
          if (savedTeam && savedPassword) {
            const team = teamsArray.find(t => t.name === savedTeam);
            console.log('TeamSelection: Found saved team:', team);
            if (team) {
              // Determine role
              const isAdminLogin =
                savedPassword === team.adminPassword ||
                savedPassword === (data.settings?.masterPassword || "admin2024");
              const isValidPassword =
                savedPassword === team.password ||
                isAdminLogin;
              if (isValidPassword) {
                setSelectedTeam(team);
                setIsAdmin(isAdminLogin);
                setStep('user');
              } else {
                localStorage.removeItem('selectedTeam');
                localStorage.removeItem('teamPassword');
                localStorage.removeItem('isAdmin');
              }
            }
          }
        } else {
          console.log('TeamSelection: API failed, using fallback teams');
          // Fallback to default teams if API fails
          setTeams([
            {
              name: "Team Omri",
              color: "#1976d2",
              members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"]
            },
            {
              name: "Team Yoad",
              color: "#d32f2f",
              members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"]
            },
          ]);
        }
      } catch (error) {
        console.error('TeamSelection: Error loading teams:', error);
        // Fallback to default teams
        setTeams([
          {
            name: "Team Omri",
            color: "#1976d2",
            members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"]
          },
          {
            name: "Team Yoad",
            color: "#d32f2f",
            members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"]
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    loadTeams();
  }, []);

  function handleTeamSelect(team) {
    setSelectedTeam(team);
    setTeamPassword("");
    setError("");
    setStep('password');
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    const isAdminLogin =
      teamPassword === selectedTeam.adminPassword ||
      teamPassword === masterPassword;
    const isValidPassword =
      teamPassword === selectedTeam.password ||
      isAdminLogin;
    if (isValidPassword) {
      localStorage.setItem('selectedTeam', selectedTeam.name);
      localStorage.setItem('teamPassword', teamPassword);
      localStorage.setItem('isAdmin', isAdminLogin ? '1' : '0');
      setIsAdmin(isAdminLogin);
      setStep('user');
    } else {
      setError("Incorrect password");
    }
  }

  function handleUserSelect(playerName) {
    onSelectPlayer(playerName, isAdmin);
  }

  function handleBack() {
    if (step === 'password') {
      setStep('team');
      setSelectedTeam(null);
      setTeamPassword("");
      setError("");
    } else if (step === 'user') {
      setStep('team');
      setSelectedTeam(null);
      setTeamPassword("");
      setError("");
      // Clear saved login when going back to team selection
      localStorage.removeItem('selectedTeam');
      localStorage.removeItem('teamPassword');
      localStorage.removeItem('isAdmin');
    }
  }

  if (loading) {
    return (
      <div className="team-selection-container fancy-bg">
        <h1 className="team-title">🏆 Drunksters</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading teams...
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="team-selection-container fancy-bg">
        <h1 className="team-title">🏆 Drunksters</h1>
        <h2>Enter password for {selectedTeam.name}</h2>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <input
            type="password"
            value={teamPassword}
            onChange={e => setTeamPassword(e.target.value)}
            placeholder="Team Password"
            style={{ fontSize: '1.2rem', padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" className="team-button card-style" style={{ background: selectedTeam.color }}>
            Continue
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <button style={{ marginTop: '1rem', background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem' }} onClick={handleBack}>
          ← Back to Teams
        </button>
      </div>
    );
  }

  if (step === 'user') {
    return (
      <div className="team-selection-container fancy-bg">
        <h1 className="team-title">🏆 Drunksters</h1>
        <h2>Choose your player in {selectedTeam.name}</h2>
        <div className="player-list">
          {selectedTeam.members.map((name) => (
            <button
              key={name}
              className="player-button card-style"
              style={{ background: selectedTeam.color, animationDelay: `${Math.random() * 0.2}s` }}
              onClick={() => handleUserSelect(name)}
            >
              <span className="player-avatar" aria-label={name}>{getPlayerAvatar(name)}</span>
              <span className="player-name">{name}</span>
            </button>
          ))}
        </div>
        <button style={{ marginTop: '1rem', background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem' }} onClick={handleBack}>
          ← Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="team-selection-container fancy-bg">
      <h1 className="team-title">🏆 Drunksters</h1>
      <div className="team-subtitle">Choose your team to start the quest! 🎉</div>
      <div className="team-groups">
        {teams.map((team) => (
          <div key={team.name} className="team-group">
            <button
              className="team-button card-style"
              style={{ background: team.color, animationDelay: `${Math.random() * 0.2}s` }}
              onClick={() => handleTeamSelect(team)}
            >
              <div className="team-info">
                <h3 className="team-name">{team.name}</h3>
                <p className="team-members">{team.members.length} members</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 