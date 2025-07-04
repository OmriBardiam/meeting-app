import React, { useState, useEffect } from 'react';
import { API_BASE, LAYOUT } from './config';

// Responsive utility function
const getResponsiveStyles = () => {
  const isMobile = window.innerWidth <= 480;
  const isTablet = window.innerWidth <= 768;
  
  return {
    containerMaxWidth: isMobile ? LAYOUT.MOBILE_MAX_WIDTH : isTablet ? LAYOUT.TABLET_MAX_WIDTH : LAYOUT.DESKTOP_MAX_WIDTH,
    padding: isMobile ? LAYOUT.MOBILE_PADDING : isTablet ? LAYOUT.TABLET_PADDING : LAYOUT.DESKTOP_PADDING,
    isMobile,
    isTablet
  };
};

function Settings({ player, gameState, onBack, onUpdateGameState, adminPassword, setAdminPassword, isAdmin }) {
  const [settings, setSettings] = useState({
    teams: {
      "Team Omri": {
        color: '#1976d2',
        members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
        admin: "Omri"
      },
      "Team Yoad": {
        color: '#d32f2f',
        members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
        admin: "Yoad"
      }
    },
    questPoints: 10,
    masterPassword: '',
    chatEnabled: true
  });

  const [editingTeam, setEditingTeam] = useState(null);
  const [newMember, setNewMember] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [responsiveStyles, setResponsiveStyles] = useState(getResponsiveStyles());

  // Update responsive styles on window resize
  useEffect(() => {
    const handleResize = () => setResponsiveStyles(getResponsiveStyles());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  // Only show admin UI if player is the admin for their team AND used the admin password
  const isTeamAdmin = isAdmin && playerTeam && player === playerTeam.admin;

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
            masterPassword: data.settings?.masterPassword || "",
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

  const handleSaveSettings = async () => {
    if (!isTeamAdmin) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          admin: player,
          adminPassword,
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
    setSettings({
      teams: {},
      questPoints: 10,
      masterPassword: '',
      chatEnabled: true
    });
  };

  // Style objects for layout and theming
  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    margin: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: responsiveStyles.isMobile ? '1rem' : '2vw 1vw 1vw 1vw',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    maxWidth: '100vw',
    position: 'relative',
    background: `linear-gradient(135deg, ${playerTeam?.color || '#667eea'}20 0%, ${playerTeam?.color || '#764ba2'}40 100%)`,
    overflow: 'hidden' // Prevent horizontal scroll
  };

  const cardStyle = {
    background: `rgba(255,255,255,${LAYOUT.CARD_BG_OPACITY})`,
    borderRadius: LAYOUT.BORDER_RADIUS,
    boxShadow: LAYOUT.CARD_SHADOW,
    padding: responsiveStyles.isMobile ? '1rem' : responsiveStyles.padding,
    border: '1.5px solid #fff',
    backdropFilter: 'blur(2px)',
    width: '100%',
    maxWidth: responsiveStyles.isMobile ? '95vw' : '600px',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflow: 'hidden' // Prevent horizontal scroll
  };

  const sectionStyle = {
    background: `rgba(255,255,255,${LAYOUT.SECTION_BG_OPACITY})`,
    borderRadius: LAYOUT.SMALL_BORDER_RADIUS,
    padding: responsiveStyles.isMobile ? '1rem' : '1.5rem',
    border: '1px solid rgba(255,255,255,0.3)',
    marginBottom: LAYOUT.SECTION_GAP,
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden' // Prevent horizontal scroll
  };

  const buttonStyle = (color = playerTeam?.color || '#667eea') => ({
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: LAYOUT.SMALL_BORDER_RADIUS,
    padding: responsiveStyles.isMobile ? '0.5rem 0.8rem' : '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: responsiveStyles.isMobile ? '0.9rem' : '1rem',
    boxShadow: LAYOUT.BUTTON_SHADOW
  });

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              color: playerTeam?.color || '#667eea', 
              fontWeight: 800, 
              fontSize: responsiveStyles.isMobile ? '1.5rem' : '1.8rem', 
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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: playerTeam?.color || '#667eea', 
            fontWeight: 800, 
            fontSize: responsiveStyles.isMobile ? '1.5rem' : '1.8rem', 
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
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
                      alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: responsiveStyles.isMobile ? 'auto' : '120px',
                        marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0'
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
                          alignSelf: responsiveStyles.isMobile ? 'flex-start' : 'center'
                        }}
                      />
                    </div>

                    {/* Team Password */}
                    <div style={{ 
                      display: 'flex', 
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
                      alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: responsiveStyles.isMobile ? 'auto' : '120px',
                        marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0',
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
                          width: responsiveStyles.isMobile ? '100%' : 'auto',
                          boxSizing: 'border-box',
                          minWidth: 0 // Allow flex item to shrink
                        }}
                      />
                    </div>

                    {/* Admin Password */}
                    <div style={{ 
                      display: 'flex', 
                      gap: LAYOUT.SMALL_GAP,
                      flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
                      alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <label style={{ 
                        fontWeight: 600, 
                        minWidth: responsiveStyles.isMobile ? 'auto' : '120px',
                        marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0',
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
                          width: responsiveStyles.isMobile ? '100%' : 'auto',
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
                        {[team.admin, ...team.members.filter(m => m !== team.admin)].map(member => (
                          <div key={member} style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #eee',
                            fontSize: responsiveStyles.isMobile ? '0.8rem' : '1rem',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            wordBreak: 'break-word',
                            opacity: member === team.admin ? 0.7 : 1,
                            fontWeight: member === team.admin ? 700 : 500
                          }}>
                            <span style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              maxWidth: responsiveStyles.isMobile ? '80px' : '120px',
                              color: member === team.admin ? team.color : undefined
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
                                cursor: member === team.admin ? 'not-allowed' : 'pointer',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                opacity: member === team.admin ? 0.4 : 1
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
                        flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
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
                            width: responsiveStyles.isMobile ? '100%' : 'auto',
                            boxSizing: 'border-box',
                            minWidth: 0 // Allow flex item to shrink
                          }}
                        />
                        <button 
                          onClick={() => handleAddMember(teamName)} 
                          style={{
                            ...buttonStyle(team.color),
                            flexShrink: 0,
                            minWidth: responsiveStyles.isMobile ? '60px' : 'auto'
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
              gap: LAYOUT.SMALL_GAP, 
              marginBottom: LAYOUT.ITEM_GAP,
              flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
              alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <label style={{ 
                fontWeight: 600, 
                minWidth: responsiveStyles.isMobile ? 'auto' : '120px',
                marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0',
                flexShrink: 0
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
                  width: responsiveStyles.isMobile ? '100%' : '100px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: LAYOUT.SMALL_GAP, 
              marginBottom: LAYOUT.ITEM_GAP,
              flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
              alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <label style={{ 
                fontWeight: 600, 
                minWidth: responsiveStyles.isMobile ? 'auto' : '120px',
                marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0',
                flexShrink: 0
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
                  width: responsiveStyles.isMobile ? '100%' : 'auto',
                  boxSizing: 'border-box',
                  minWidth: 0 // Allow flex item to shrink
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: LAYOUT.SMALL_GAP,
              flexDirection: responsiveStyles.isMobile ? 'column' : 'row',
              alignItems: responsiveStyles.isMobile ? 'flex-start' : 'center'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: 600,
                marginBottom: responsiveStyles.isMobile ? '0.5rem' : '0'
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
            flexDirection: responsiveStyles.isMobile ? 'column' : 'row'
          }}>
            <button 
              onClick={handleSaveSettings} 
              disabled={saving}
              style={{
                ...buttonStyle(),
                padding: responsiveStyles.isMobile ? '0.75rem 1.5rem' : '0.75rem 2rem',
                fontSize: responsiveStyles.isMobile ? '0.9rem' : '1rem',
                width: responsiveStyles.isMobile ? '100%' : 'auto'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              onClick={handleResetToDefault}
              style={{
                ...buttonStyle('#ff9800'),
                padding: responsiveStyles.isMobile ? '0.75rem 1.5rem' : '0.75rem 2rem',
                fontSize: responsiveStyles.isMobile ? '0.9rem' : '1rem',
                width: responsiveStyles.isMobile ? '100%' : 'auto'
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