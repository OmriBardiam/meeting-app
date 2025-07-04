import React, { useState, useEffect } from "react";
import { API_BASE, getPlayerAvatar } from "./config";
import "./TeamSelection.css";

export default function PlayerSelection({ onSelectPlayer }) {
  const [teams, setTeams] = useState([]);
  const [masterPassword, setMasterPassword] = useState("admin2024");
  const [pendingPlayer, setPendingPlayer] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        } else {
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
        console.error('Error loading teams:', error);
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

  function handlePlayerClick(name) {
    setPendingPlayer(name);
    setPassword("");
    setError("");
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    
    // Find the team this player belongs to
    const playerTeam = teams.find(team => team.members.includes(pendingPlayer));
    
    if (!playerTeam) {
      setError("Player not found in any team");
      return;
    }

    // Check if password matches team password, admin password, or master password
    const isValidPassword = 
      password === playerTeam.password || 
      password === playerTeam.adminPassword || 
      password === masterPassword;

    if (isValidPassword) {
      onSelectPlayer(pendingPlayer);
    } else {
      setError("Incorrect password");
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

  if (pendingPlayer) {
    const playerTeam = teams.find(team => team.members.includes(pendingPlayer));
    return (
      <div className="team-selection-container fancy-bg">
        <h1 className="team-title">🏆 Drunksters</h1>
        <h2>Enter password for {pendingPlayer}</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Team: {playerTeam?.name}
        </p>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Team Password"
            style={{ fontSize: '1.2rem', padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" className="team-button card-style" style={{ background: playerTeam?.color }}>
            Join Quest
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <button style={{ marginTop: '1rem', background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem' }} onClick={() => setPendingPlayer(null)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="team-selection-container fancy-bg">
      <h1 className="team-title">🏆 Drunksters</h1>
      <div className="team-subtitle">Pick your player to start the quest! 🎉</div>
      <div className="team-groups">
        {teams.map((team) => (
          <div key={team.name} className="team-group">
            <div className="team-label" style={{ color: team.color }}>{team.name}</div>
            <div className="player-list">
              {team.members.map((name) => (
                <button
                  key={name}
                  className="player-button card-style"
                  style={{ background: team.color, animationDelay: `${Math.random() * 0.2}s` }}
                  onClick={() => handlePlayerClick(name)}
                >
                  <span className="player-avatar" aria-label={name}>{getPlayerAvatar(name)}</span>
                  <span className="player-name">{name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 