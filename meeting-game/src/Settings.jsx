import React, { useState, useEffect } from 'react';
import { API_BASE, LAYOUT } from './config';

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

  // Simple container style matching Dashboard
  const containerStyle = {
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
    position: 'relative',
    background: `linear-gradient(135deg, ${playerTeam?.color || '#667eea'}20 0%, ${playerTeam?.color || '#764ba2'}40 100%)`
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    boxShadow: '0 2px 12px #0002',
    padding: '1.5rem',
    border: '1.5px solid #fff',
    backdropFilter: 'blur(2px)',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    padding: '1.5rem',
    border: '1px solid rgba(255,255,255,0.3)',
    marginBottom: '1.5rem'
  };

  const buttonStyle = (color = playerTeam?.color || '#667eea') => ({
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    boxShadow: '0 1px 4px #0002'
  });

  if (!isAdmin) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              color: playerTeam?.color || '#667eea', 
              fontWeight: 800, 
              fontSize: '1.8rem', 
              margin: 0 
            }}>🏆 Drunksters Settings</h1>
            <button onClick={onBack} style={buttonStyle()}>← Back</button>
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
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              color: playerTeam?.color || '#667eea', 
              fontWeight: 800, 
              fontSize: '1.8rem', 
              margin: 0 
            }}>🏆 Drunksters Settings</h1>
            <button onClick={onBack} style={buttonStyle()}>← Back</button>
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
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: playerTeam?.color || '#667eea', 
            fontWeight: 800, 
            fontSize: '1.8rem', 
            margin: 0 
          }}>🏆 Drunksters Settings</h1>
          <button onClick={onBack} style={buttonStyle()}>← Back</button>
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
          <div style={sectionStyle}>
            <h2 style={{ color: playerTeam?.color || '#667eea', fontWeight: 700, marginBottom: '1.5rem' }}>Team Management</h2>
            {Object.entries(settings.teams).map(([teamName, team]) => (
              <div key={teamName} style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: team.color, fontWeight: 700, margin: 0 }}>{teamName}</h3>
                  <button 
                    onClick={() => handleTeamEdit(teamName)}
                    style={buttonStyle(team.color)}
                  >
                    {editingTeam === teamName ? 'Done' : 'Edit'}
                  </button>
                </div>

                {editingTeam === teamName && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: LAYOUT.ITEM_GAP }}>
                    {/* Team Color */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: 'auto',
                        marginBottom: '0.5rem'
                      }}>Team Color:</label>
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
                        style={{ 
                          width: '50px', 
                          height: '30px', 
                          border: 'none', 
                          borderRadius: 4,
                          alignSelf: 'flex-start'
                        }}
                      />
                    </div>

                    {/* Team Password */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: 'auto',
                        marginBottom: '0.5rem',
                        flexShrink: 0
                      }}>Team Password:</label>
                      <input
                        type="text"
                        value={team.password}
                        onChange={(e) => handleChangePassword(teamName, 'password', e.target.value)}
                        placeholder="Team password"
                        style={{ 
                          flex: 1, 
                          padding: '0.5rem', 
                          borderRadius: 6, 
                          border: '1px solid #ccc',
                          width: '100%',
                          boxSizing: 'border-box',
                          minWidth: 0 // Allow flex item to shrink
                        }}
                      />
                    </div>

                    {/* Admin Password */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: 'auto',
                        marginBottom: '0.5rem',
                        flexShrink: 0
                      }}>Admin Password:</label>
                      <input
                        type="text"
                        value={team.adminPassword}
                        onChange={(e) => handleChangePassword(teamName, 'adminPassword', e.target.value)}
                        placeholder="Admin password"
                        style={{ 
                          flex: 1, 
                          padding: '0.5rem', 
                          borderRadius: 6, 
                          border: '1px solid #ccc',
                          width: '100%',
                          boxSizing: 'border-box',
                          minWidth: 0 // Allow flex item to shrink
                        }}
                      />
                    </div>

                    {/* Team Members */}
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <label style={{ 
                        fontWeight: 600, 
                        display: 'block', 
                        marginBottom: '0.5rem' 
                      }}>Team Members:</label>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: LAYOUT.SMALL_GAP, 
                        marginBottom: LAYOUT.ITEM_GAP,
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        {team.members.map(member => (
                          <div key={member} style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #eee',
                            fontSize: '0.8rem',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            wordBreak: 'break-word'
                          }}>
                            <span style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              maxWidth: '80px'
                            }}>{member}</span>
                            <button 
                              onClick={() => handleRemoveMember(teamName, member)}
                              style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                              disabled={member === team.admin}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: LAYOUT.SMALL_GAP,
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <input
                          type="text"
                          value={newMember}
                          onChange={(e) => setNewMember(e.target.value)}
                          placeholder="New member name"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddMember(teamName)}
                          style={{ 
                            flex: 1, 
                            padding: '0.5rem', 
                            borderRadius: 6, 
                            border: '1px solid #ccc',
                            width: '100%',
                            boxSizing: 'border-box',
                            minWidth: 0 // Allow flex item to shrink
                          }}
                        />
                        <button 
                          onClick={() => handleAddMember(teamName)} 
                          style={{
                            ...buttonStyle(team.color),
                            flexShrink: 0,
                            minWidth: '60px'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Game Settings */}
          <div style={sectionStyle}>
            <h2 style={{ color: playerTeam?.color || '#667eea', fontWeight: 700, marginBottom: '1.5rem' }}>Game Settings</h2>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: LAYOUT.SMALL_GAP, 
              marginBottom: LAYOUT.ITEM_GAP,
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <label style={{ 
                fontWeight: 600, 
                minWidth: 'auto',
                marginBottom: '0.5rem'
              }}>Quest Points:</label>
              <input
                type="number"
                value={settings.questPoints}
                onChange={(e) => setSettings(prev => ({ ...prev, questPoints: parseInt(e.target.value) || 0 }))}
                min="1"
                max="100"
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: 6, 
                  border: '1px solid #ccc', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: LAYOUT.SMALL_GAP, 
              marginBottom: LAYOUT.ITEM_GAP,
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <label style={{ 
                fontWeight: 600, 
                minWidth: 'auto',
                marginBottom: '0.5rem'
              }}>Master Password:</label>
              <input
                type="text"
                value={settings.masterPassword}
                onChange={(e) => setSettings(prev => ({ ...prev, masterPassword: e.target.value }))}
                placeholder="Master admin password"
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  borderRadius: 6, 
                  border: '1px solid #ccc',
                  width: '100%',
                  boxSizing: 'border-box',
                  minWidth: 0 // Allow flex item to shrink
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: LAYOUT.SMALL_GAP,
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
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
          <div style={{ 
            display: 'flex', 
            gap: LAYOUT.ITEM_GAP, 
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <button 
              onClick={handleSaveSettings} 
              disabled={saving}
              style={{
                ...buttonStyle(),
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              onClick={handleResetToDefault}
              style={{
                ...buttonStyle('#ff9800'),
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                width: '100%'
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