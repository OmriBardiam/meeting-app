import { useState } from 'react'
import Chat from './Chat'

// Use the same API base URL logic as App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://meeting-app-backend-hh3f.onrender.com'
    : 'https://meeting-app-backend-hh3f.onrender.com');

const initialTeams = {
  "Team Omri": {
    color: '#1976d2',
    members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
    score: 0,
    admin: "Omri",
  },
  "Team Yoad": {
    color: '#d32f2f',
    members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
    score: 0,
    admin: "Yoad",
  },
};

function getTeamByPlayer(player, teams) {
  for (const [teamName, team] of Object.entries(teams)) {
    if (team.members.includes(player)) {
      return { ...team, name: teamName };
    }
  }
  return null;
}

function Dashboard({ player, gameState, onLogout, onUpdateScore }) {
  const [showChat, setShowChat] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const playerTeam = getTeamByPlayer(player, gameState?.teams || initialTeams);
  const isAdmin = playerTeam?.admin === player;

  const handleScoreUpdate = async (delta) => {
    if (!isAdmin) {
      setPendingAction({ type: 'score', delta });
      setShowPasswordModal(true);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: playerTeam.name,
          delta,
          admin: player
        })
      });
      
      if (response.ok) {
        onUpdateScore();
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleQuestToggle = async (questId) => {
    if (!isAdmin) {
      setPendingAction({ type: 'quest', questId });
      setShowPasswordModal(true);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/quest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: playerTeam.name,
          questId,
          admin: player
        })
      });
      
      if (response.ok) {
        onUpdateScore();
      }
    } catch (error) {
      console.error('Error toggling quest:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (adminPassword === 'admin2024') {
      setShowPasswordModal(false);
      setAdminPassword('');
      
      if (pendingAction?.type === 'score') {
        try {
          const response = await fetch(`${API_BASE}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamName: playerTeam.name,
              delta: pendingAction.delta,
              admin: 'admin'
            })
          });
          
          if (response.ok) {
            onUpdateScore();
          }
        } catch (error) {
          console.error('Error updating score:', error);
        }
      } else if (pendingAction?.type === 'quest') {
        try {
          const response = await fetch(`${API_BASE}/quest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamName: playerTeam.name,
              questId: pendingAction.questId,
              admin: 'admin'
            })
          });
          
          if (response.ok) {
            onUpdateScore();
          }
        } catch (error) {
          console.error('Error toggling quest:', error);
        }
      }
      
      setPendingAction(null);
    } else {
      alert('Incorrect password');
    }
  };

  if (!playerTeam) {
    return <div>Player not found in any team</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏆 Drunksters</h1>
          <p>Welcome, {player}!</p>
        </div>
        <div className="header-right">
          <button className="chat-toggle" onClick={() => setShowChat(!showChat)}>
            💬 {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="team-info">
          <div className="team-header" style={{ borderColor: playerTeam.color }}>
            <h2 style={{ color: playerTeam.color }}>{playerTeam.name}</h2>
            <div className="score-display">
              <span className="score-label">Score:</span>
              <span className="score-value" style={{ color: playerTeam.color }}>
                {playerTeam.score}
              </span>
            </div>
          </div>

          <div className="team-members">
            <h3>Team Members:</h3>
            <div className="members-list">
              {playerTeam.members.map(member => (
                <span 
                  key={member} 
                  className={`member ${member === player ? 'current-player' : ''}`}
                  style={{ 
                    backgroundColor: member === player ? playerTeam.color : 'transparent',
                    color: member === player ? 'white' : 'inherit'
                  }}
                >
                  {member}
                </span>
              ))}
            </div>
          </div>

          <div className="score-controls">
            <h3>Score Controls:</h3>
            <div className="score-buttons">
              <button onClick={() => handleScoreUpdate(-1)}>-1</button>
              <button onClick={() => handleScoreUpdate(1)}>+1</button>
              <button onClick={() => handleScoreUpdate(5)}>+5</button>
              <button onClick={() => handleScoreUpdate(10)}>+10</button>
            </div>
          </div>

          <div className="quests">
            <h3>Quests:</h3>
            <div className="quests-list">
              {gameState?.quests[playerTeam.name]?.map(quest => (
                <div key={quest.id} className="quest-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={quest.completed}
                      onChange={() => handleQuestToggle(quest.id)}
                    />
                    <span className={quest.completed ? 'completed' : ''}>
                      {quest.text}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showChat && (
          <div className="chat-section">
            <Chat 
              player={player} 
              teamName={playerTeam.name} 
              teamColor={playerTeam.color}
            />
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter Admin Password</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="modal-buttons">
              <button onClick={handlePasswordSubmit}>Submit</button>
              <button onClick={() => {
                setShowPasswordModal(false);
                setAdminPassword('');
                setPendingAction(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard 