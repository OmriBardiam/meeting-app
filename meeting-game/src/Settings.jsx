import React, { useState, useEffect } from 'react';

// Use the same API base URL logic as App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://drunksters-backend-production.up.railway.app'
    : 'https://drunksters-backend-production.up.railway.app');

function Settings({ player, gameState, onBack, onUpdateGameState }) {
  const [settings, setSettings] = useState({
    teams: {
      "Team Omri": {
        color: '#1976d2',
        members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
        password: "teamomri2024",
        adminPassword: "omriadmin2024",
        admin: "Omri"
      },
      "Team Yoad": {
        color: '#d32f2f',
        members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
        password: "teamyoad2024",
        adminPassword: "yoadadmin2024",
        admin: "Yoad"
      }
    },
    questPoints: 10,
    masterPassword: "admin2024",
    chatEnabled: true
  });

  const [editingTeam, setEditingTeam] = useState(null);
  const [newMember, setNewMember] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Get player's team for theming
  const getPlayerTeam = () => {
    for (const [teamName, team] of Object.entries(gameState.teams)) {
      if (team.members.includes(player)) {
        return { ...team, name: teamName };
      }
    }
    return null;
  };
  const playerTeam = getPlayerTeam();

  // Load current settings from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings({
            teams: data.teams,
            questPoints: data.settings?.questPoints || 10,
            masterPassword: data.settings?.masterPassword || "admin2024",
            chatEnabled: data.settings?.chatEnabled !== false
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  const isAdmin = player === 'Omri' || player === 'Yoad';

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${playerTeam?.color || '#667eea'}20 0%, ${playerTeam?.color || '#764ba2'}40 100%)`,
        padding: '2rem',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          boxShadow: '0 2px 12px #0002',
          padding: '1.5rem',
          border: '1.5px solid #fff',
          backdropFilter: 'blur(2px)',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: playerTeam?.color || '#667eea', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>🏆 Drunksters Settings</h1>
            <button onClick={onBack} style={{
              background: playerTeam?.color || '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600
            }}>← Back</button>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <h2 style={{ color: playerTeam?.color || '#667eea', marginBottom: '1rem' }}>Access Denied</h2>
            <p>Only team admins can access settings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${playerTeam?.color || '#667eea'}20 0%, ${playerTeam?.color || '#764ba2'}40 100%)`,
        padding: '2rem',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          boxShadow: '0 2px 12px #0002',
          padding: '1.5rem',
          border: '1.5px solid #fff',
          backdropFilter: 'blur(2px)',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: playerTeam?.color || '#667eea', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>🏆 Drunksters Settings</h1>
            <button onClick={onBack} style={{
              background: playerTeam?.color || '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600
            }}>← Back</button>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          admin: player
        })
      });
      
      if (response.ok) {
        setMessage('Settings saved successfully!');
        // Update the game state to reflect changes
        onUpdateGameState();
      } else {
        const errorData = await response.json();
        setMessage(`Failed to save settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTeamEdit = (teamName) => {
    setEditingTeam(editingTeam === teamName ? null : teamName);
  };

  const handleAddMember = (teamName) => {
    if (!newMember.trim()) return;
    
    setSettings(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamName]: {
          ...prev.teams[teamName],
          members: [...prev.teams[teamName].members, newMember.trim()]
        }
      }
    }));
    setNewMember('');
  };

  const handleRemoveMember = (teamName, member) => {
    setSettings(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamName]: {
          ...prev.teams[teamName],
          members: prev.teams[teamName].members.filter(m => m !== member)
        }
      }
    }));
  };

  const handleChangePassword = (teamName, type, value) => {
    setSettings(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamName]: {
          ...prev.teams[teamName],
          [type]: value
        }
      }
    }));
  };

  const handleResetToDefault = () => {
    const defaultSettings = {
      teams: {
        "Team Omri": {
          color: '#1976d2',
          members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
          password: "teamomri2024",
          adminPassword: "omriadmin2024",
          admin: "Omri"
        },
        "Team Yoad": {
          color: '#d32f2f',
          members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
          password: "teamyoad2024",
          adminPassword: "yoadadmin2024",
          admin: "Yoad"
        }
      },
      questPoints: 10,
      masterPassword: "admin2024",
      chatEnabled: true
    };
    setSettings(defaultSettings);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${playerTeam?.color || '#667eea'}20 0%, ${playerTeam?.color || '#764ba2'}40 100%)`,
      padding: '2rem',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 16,
        boxShadow: '0 2px 12px #0002',
        padding: '1.5rem',
        border: '1.5px solid #fff',
        backdropFilter: 'blur(2px)',
        maxWidth: 800,
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: playerTeam?.color || '#667eea', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>🏆 Drunksters Settings</h1>
          <button onClick={onBack} style={{
            background: playerTeam?.color || '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 600
          }}>← Back</button>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            background: message.includes('success') ? '#4caf50' : '#f44336',
            color: 'white',
            fontWeight: 600
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Team Management */}
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 12,
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h2 style={{ color: playerTeam?.color || '#667eea', fontWeight: 700, marginBottom: '1.5rem' }}>Team Management</h2>
            {Object.entries(settings.teams).map(([teamName, team]) => (
              <div key={teamName} style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: team.color, fontWeight: 700, margin: 0 }}>{teamName}</h3>
                  <button 
                    onClick={() => handleTeamEdit(teamName)}
                    style={{
                      background: team.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {editingTeam === teamName ? 'Done' : 'Edit'}
                  </button>
                </div>

                {editingTeam === teamName && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Team Color */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ fontWeight: 600, minWidth: '120px' }}>Team Color:</label>
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          teams: {
                            ...prev.teams,
                            [teamName]: { ...team, color: e.target.value }
                          }
                        }))}
                        style={{ width: '50px', height: '30px', border: 'none', borderRadius: 4 }}
                      />
                    </div>

                    {/* Team Password */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ fontWeight: 600, minWidth: '120px' }}>Team Password:</label>
                      <input
                        type="text"
                        value={team.password}
                        onChange={(e) => handleChangePassword(teamName, 'password', e.target.value)}
                        placeholder="Team password"
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                      />
                    </div>

                    {/* Admin Password */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ fontWeight: 600, minWidth: '120px' }}>Admin Password:</label>
                      <input
                        type="text"
                        value={team.adminPassword}
                        onChange={(e) => handleChangePassword(teamName, 'adminPassword', e.target.value)}
                        placeholder="Admin password"
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                      />
                    </div>

                    {/* Team Members */}
                    <div>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Team Members:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {team.members.map(member => (
                          <div key={member} style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #eee'
                          }}>
                            <span>{member}</span>
                            <button 
                              onClick={() => handleRemoveMember(teamName, member)}
                              style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              disabled={member === team.admin}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={newMember}
                          onChange={(e) => setNewMember(e.target.value)}
                          placeholder="New member name"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddMember(teamName)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                        />
                        <button onClick={() => handleAddMember(teamName)} style={{
                          background: team.color,
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}>Add</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Game Settings */}
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 12,
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h2 style={{ color: playerTeam?.color || '#667eea', fontWeight: 700, marginBottom: '1.5rem' }}>Game Settings</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, minWidth: '120px' }}>Quest Points:</label>
              <input
                type="number"
                value={settings.questPoints}
                onChange={(e) => setSettings(prev => ({ ...prev, questPoints: parseInt(e.target.value) || 0 }))}
                min="1"
                max="100"
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, minWidth: '120px' }}>Master Password:</label>
              <input
                type="text"
                value={settings.masterPassword}
                onChange={(e) => setSettings(prev => ({ ...prev, masterPassword: e.target.value }))}
                placeholder="Master admin password"
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={settings.chatEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, chatEnabled: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                Enable team chat
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={handleSaveSettings} 
              disabled={saving}
              style={{
                background: playerTeam?.color || '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              onClick={handleResetToDefault}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 