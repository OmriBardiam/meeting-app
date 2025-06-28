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
    members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
  },
  {
    name: "Team Yoad",
    color: "#d32f2f",
    members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
  },
];

const playerPasswords = {
  // Team Omri
  Keniya: "dolphin17",
  Pita: "sunset34",
  Misha: "forest56",
  Roni: "ocean78",
  Omri: "jellyfish42",
  
  // Team Yoad
  Meitav: "river91",
  Jules: "cloud23",
  Tetro: "star45",
  Idan: "moon67",
  Yoad: "mountain89",
  Segev: "eagle12",
};

// Master password for admin access to any user
const MASTER_PASSWORD = "admin2024";

export default function PlayerSelection({ gameState, onPlayerSelect }) {
  if (!gameState) {
    return <div>Loading...</div>;
  }

  const allPlayers = [];
  Object.entries(gameState.teams).forEach(([teamName, team]) => {
    team.members.forEach(player => {
      allPlayers.push({ name: player, team: teamName, color: team.color });
    });
  });

  return (
    <div className="player-selection">
      <div className="header">
        <h1>🏆 Drunksters</h1>
        <p>Choose your player to start the quest!</p>
      </div>
      
      <div className="teams-container">
        {Object.entries(gameState.teams).map(([teamName, team]) => (
          <div key={teamName} className="team-section">
            <h2 style={{ color: team.color }}>{teamName}</h2>
            <div className="players-grid">
              {team.members.map(player => (
                <button
                  key={player}
                  className="player-button"
                  style={{ 
                    borderColor: team.color,
                    backgroundColor: team.color + '20'
                  }}
                  onClick={() => onPlayerSelect(player)}
                >
                  {player}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 