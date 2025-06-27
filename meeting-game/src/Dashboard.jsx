import { useState } from 'react'

// Use the same API base URL logic as App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://meeting-app-backend-hh3f.onrender.com');

const initialTeams = {
  "Team Omri": {
    color: '#1976d2',
    members: ["Keniya", "Pita", "Misha", "Roni", "Omri"],
    score: 0,
    admin: "Omri",
  },
  "Team Yoad": {
    color: '#d32f2f',
    members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad", "Segev"],
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

function Dashboard({ player, gameState, onLogout, onScoreUpdate }) {
  const team = getTeamByPlayer(player, gameState.teams);
  if (!team) return <div>Team not found.</div>;
  const isAdmin = player === team.admin;
  const quests = gameState.quests[team.name] || [];

  // State for adding and editing quests
  const [newQuest, setNewQuest] = useState("");
  const [addingQuest, setAddingQuest] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState(null);
  const [editingQuestText, setEditingQuestText] = useState("");

  async function updateScore(delta) {
    try {
      const response = await fetch(`${API_BASE}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.name,
          delta,
          admin: player,
        }),
      });
      if (response.ok) {
        onScoreUpdate();
      } else {
        console.error('Failed to update score');
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  }

  async function toggleQuest(questId) {
    try {
      const response = await fetch(`${API_BASE}/quest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.name,
          questId,
          admin: player,
        }),
      });
      if (response.ok) {
        onScoreUpdate();
      } else {
        console.error('Failed to update quest');
      }
    } catch (error) {
      console.error('Error updating quest:', error);
    }
  }

  async function addQuest() {
    if (!newQuest.trim()) return;
    setAddingQuest(true);
    try {
      const response = await fetch(`${API_BASE}/quest`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.name,
          text: newQuest,
          admin: player,
        }),
      });
      if (response.ok) {
        setNewQuest("");
        onScoreUpdate();
      } else {
        console.error('Failed to add quest');
      }
    } catch (error) {
      console.error('Error adding quest:', error);
    } finally {
      setAddingQuest(false);
    }
  }

  async function deleteQuest(questId) {
    try {
      const response = await fetch(`${API_BASE}/quest`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: team.name, questId, admin: player }),
      });
      if (response.ok) {
        onScoreUpdate();
      } else {
        console.error('Failed to delete quest');
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
    }
  }

  async function startEditQuest(quest) {
    setEditingQuestId(quest.id);
    setEditingQuestText(quest.text);
  }

  async function saveEditQuest(questId) {
    if (!editingQuestText.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/quest`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: team.name, questId, text: editingQuestText, admin: player }),
      });
      if (response.ok) {
        setEditingQuestId(null);
        setEditingQuestText("");
        onScoreUpdate();
      } else {
        console.error('Failed to edit quest');
      }
    } catch (error) {
      console.error('Error editing quest:', error);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2vw 1vw 1vw 1vw',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      maxWidth: '100vw',
      position: 'relative'
    }}>
      {/* Team Info & Score */}
      <div style={{ width: '100%', maxWidth: 340, marginBottom: '1.2rem', background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: '1rem 0.7rem', textAlign: 'center', border: '1.5px solid #fff', backdropFilter: 'blur(2px)', position: 'relative' }}>
        {/* Logout Button */}
        <button 
          onClick={onLogout}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: '#888',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 1px 4px #0002'
          }}
        >
          👤
        </button>
        
        <h1 style={{ color: team.color, fontWeight: 800, fontSize: '1.4rem', margin: 0, textShadow: '0 2px 8px #0001' }}>{team.name}</h1>
        <h2 style={{ color: '#222', fontWeight: 700, fontSize: '1.05rem', margin: '0.4rem 0 0.7rem 0' }}>Welcome, {player}!</h2>
        <div style={{ fontSize: '1.1rem', margin: '0.7rem 0', color: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', fontWeight: 700 }}>
          <strong>Score: {team.score}</strong>
          {isAdmin && (
            <>
              <button onClick={() => updateScore(-1)} style={{ fontSize: '1.1rem', padding: '0.2rem 0.7rem', borderRadius: 10, border: 'none', background: team.color, color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px #0002' }}>-</button>
              <button onClick={() => updateScore(1)} style={{ fontSize: '1.1rem', padding: '0.2rem 0.7rem', borderRadius: 10, border: 'none', background: team.color, color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px #0002' }}>+</button>
            </>
          )}
        </div>
      </div>

      {/* Teammates */}
      <div style={{ width: '100%', maxWidth: 340, marginBottom: '1.2rem', background: 'rgba(255,255,255,0.7)', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: '0.7rem 0.5rem', border: '1.5px solid #fff', backdropFilter: 'blur(2px)' }}>
        <h3 style={{ margin: 0, color: team.color, fontWeight: 700, fontSize: '0.98rem', letterSpacing: '0.01em' }}>Your teammates:</h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1rem', margin: 0, color: '#222', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {team.members.filter(name => name !== player).map(name => (
            <li key={name} style={{ background: '#fff', borderRadius: 10, padding: '0.25rem 0.7rem', boxShadow: '0 2px 8px #0001', border: '1px solid #eee' }}>{name}</li>
          ))}
        </ul>
      </div>

      {/* Secret Quests */}
      <div style={{ width: '100%', maxWidth: 340, background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: '0.7rem 0.5rem', marginBottom: '1.2rem', border: '1.5px solid #fff', backdropFilter: 'blur(2px)' }}>
        <h3 style={{ margin: 0, color: team.color, fontWeight: 700, fontSize: '0.98rem', letterSpacing: '0.01em' }}>Secret Quests</h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1rem', margin: 0 }}>
          {quests.map(q => (
            <li key={q.id} style={{ margin: '0.5rem 0', padding: '0.5rem 0' }}>
              {editingQuestId === q.id ? (
                <>
                  <input
                    value={editingQuestText}
                    onChange={e => setEditingQuestText(e.target.value)}
                    style={{ width: '100%', fontSize: '1rem', padding: '0.3rem', borderRadius: 8, border: '1px solid #ccc', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button onClick={() => saveEditQuest(q.id)} style={{ background: team.color, color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => { setEditingQuestId(null); setEditingQuestText(""); }} style={{ background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ textDecoration: q.completed ? 'line-through' : 'none', color: q.completed ? '#888' : '#222', fontWeight: 500 }}>{q.text}</span>
                    {q.completed && <span style={{ color: 'green', fontSize: '1.2em', marginLeft: 8 }}>✔️</span>}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => toggleQuest(q.id)} style={{ background: team.color, color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>
                        {q.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button onClick={() => startEditQuest(q)} style={{ background: '#ffc107', color: '#222', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deleteQuest(q.id)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 8, padding: '0.3rem 1rem', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        {isAdmin && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newQuest}
              onChange={e => setNewQuest(e.target.value)}
              placeholder="New quest..."
              style={{ flex: 1, fontSize: '1rem', padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }}
              disabled={addingQuest}
            />
            <button
              onClick={addQuest}
              style={{ background: team.color, color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
              disabled={addingQuest}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard 