import React, { useState } from "react";
import "./PlayerSelection.css";

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

const teams = [
  {
    name: "Team Omri",
    color: "#1976d2",
    members: ["Keniya", "Pita", "Misha", "Roni", "Omri"],
  },
  {
    name: "Team Yoad",
    color: "#d32f2f",
    members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad", "Segev"],
  },
];

const adminPasswords = {
  Omri: "jellyfish42",
  Yoad: "mountain89",
};

export default function PlayerSelection({ onSelectPlayer }) {
  const [pendingAdmin, setPendingAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handlePlayerClick(name) {
    if (adminPasswords[name]) {
      setPendingAdmin(name);
      setPassword("");
      setError("");
    } else {
      onSelectPlayer(name);
    }
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (password === adminPasswords[pendingAdmin]) {
      onSelectPlayer(pendingAdmin);
    } else {
      setError("Incorrect password");
    }
  }

  if (pendingAdmin) {
    return (
      <div className="player-selection-container fancy-bg">
        <h1 className="player-title">Enter password for {pendingAdmin}</h1>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ fontSize: '1.2rem', padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" className="player-button card-style" style={{ background: teams.find(t => t.members.includes(pendingAdmin)).color }}>
            Confirm
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
        <button style={{ marginTop: '1rem', background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem' }} onClick={() => setPendingAdmin(null)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="player-selection-container fancy-bg">
      <h1 className="player-title">Welcome to the Meeting Game!</h1>
      <div className="player-subtitle">Pick your player to join the fun 🎉</div>
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
                  <span className="player-avatar" aria-label={name}>{playerAvatars[name] || name[0]}</span>
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