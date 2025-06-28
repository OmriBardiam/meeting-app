import React, { useState, useEffect } from 'react';
import './TeamSelection.css';

// Use the same API base URL logic as App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://meeting-app-backend-hh3f.onrender.com'
    : 'http://192.168.1.243:3001');

const playerAvatars = {
  Keniya: "🦄",
  Pita: "🐼",
  Misha: "🦁",
  Roni: "🐰",
  Omri: "🦊",
  Meitav: "🐸",
  Jules: "🐵",
  Tetro: "🐻",
  Idan: "🐨",
  Yoad: "🐯",
  Segev: "🦒",
};

export default function TeamSelection({ onSelectPlayer }) {
  const [teams, setTeams] = useState([]);
  const [masterPassword, setMasterPassword] = useState("admin2024");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPassword, setTeamPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('team'); // 'team', 'password', 'user'

  // Load teams and master password from backend
  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
          const data = await response.json();
          const teamsArray = Object.entries(data.teams).map(([name, team]) => ({
            name,
            ...team
          }));
          setTeams(teamsArray);
          setMasterPassword(data.settings?.masterPassword || "admin2024");
          
          // Check for saved team login
          const savedTeam = localStorage.getItem('selectedTeam');
          const savedPassword = localStorage.getItem('teamPassword');
          
          if (savedTeam && savedPassword) {
            const team = teamsArray.find(t => t.name === savedTeam);
            if (team) {
              // Verify saved password is still valid
              const isValidPassword = 
                savedPassword === team.password || 
                savedPassword === team.adminPassword || 
                savedPassword === (data.settings?.masterPassword || "admin2024");
              
              if (isValidPassword) {
                setSelectedTeam(team);
                setStep('user');
              } else {
                // Clear invalid saved login
                localStorage.removeItem('selectedTeam');
                localStorage.removeItem('teamPassword');
              }
            }
          }
        } else {
          // Fallback to default teams if API fails
          setTeams([
            {
              name: "Team Omri",
              color: "#1976d2",
              members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
              password: "teamomri2024",
              adminPassword: "omriadmin2024"
            },
            {
              name: "Team Yoad",
              color: "#d32f2f",
              members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
              password: "teamyoad2024",
              adminPassword: "yoadadmin2024"
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        // Fallback to default teams
        setTeams([
          {
            name: "Team Omri",
            color: "#1976d2",
            members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
            password: "teamomri2024",
            adminPassword: "omriadmin2024"
          },
          {
            name: "Team Yoad",
            color: "#d32f2f",
            members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
            password: "teamyoad2024",
            adminPassword: "yoadadmin2024"
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
    
    // Check if password matches team password, admin password, or master password
    const isValidPassword = 
      teamPassword === selectedTeam.password || 
      teamPassword === selectedTeam.adminPassword || 
      teamPassword === masterPassword;

    if (isValidPassword) {
      // Save team login to localStorage
      localStorage.setItem('selectedTeam', selectedTeam.name);
      localStorage.setItem('teamPassword', teamPassword);
      setStep('user');
    } else {
      setError("Incorrect password");
    }
  }

  function handleUserSelect(playerName) {
    onSelectPlayer(playerName);
  }

  function handleBack() {
    if (step === 'password') {
      setStep('team');
      setSelectedTeam(null);
      setTeamPassword("");
      setError("");
    } else if (step === 'user') {
      setStep('password');
      setError("");
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
              <span className="player-avatar" aria-label={name}>{playerAvatars[name] || name[0]}</span>
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