import React, { useState, useEffect } from 'react';
import './Settings.css';

// Use the same API base URL logic as App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://meeting-app-backend-hh3f.onrender.com'
    : 'http://192.168.1.243:3001');

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
      <div className="settings-container">
        <div className="settings-header">
          <h1>🏆 Drunksters Settings</h1>
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only team admins can access settings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <h1>🏆 Drunksters Settings</h1>
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading settings...
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
    <div className="settings-container">
      <div className="settings-header">
        <h1>🏆 Drunksters Settings</h1>
        <button onClick={onBack} className="back-button">← Back</button>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-content">
        {/* Team Management */}
        <div className="settings-section">
          <h2>Team Management</h2>
          {Object.entries(settings.teams).map(([teamName, team]) => (
            <div key={teamName} className="team-settings">
              <div className="team-header">
                <h3 style={{ color: team.color }}>{teamName}</h3>
                <button 
                  onClick={() => handleTeamEdit(teamName)}
                  className="edit-button"
                >
                  {editingTeam === teamName ? 'Done' : 'Edit'}
                </button>
              </div>

              {editingTeam === teamName && (
                <div className="team-edit">
                  {/* Team Color */}
                  <div className="setting-item">
                    <label>Team Color:</label>
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
                    />
                  </div>

                  {/* Team Password */}
                  <div className="setting-item">
                    <label>Team Password:</label>
                    <input
                      type="text"
                      value={team.password}
                      onChange={(e) => handleChangePassword(teamName, 'password', e.target.value)}
                      placeholder="Team password"
                    />
                  </div>

                  {/* Admin Password */}
                  <div className="setting-item">
                    <label>Admin Password:</label>
                    <input
                      type="text"
                      value={team.adminPassword}
                      onChange={(e) => handleChangePassword(teamName, 'adminPassword', e.target.value)}
                      placeholder="Admin password"
                    />
                  </div>

                  {/* Team Members */}
                  <div className="setting-item">
                    <label>Team Members:</label>
                    <div className="members-list">
                      {team.members.map(member => (
                        <div key={member} className="member-item">
                          <span>{member}</span>
                          <button 
                            onClick={() => handleRemoveMember(teamName, member)}
                            className="remove-button"
                            disabled={member === team.admin}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="add-member">
                      <input
                        type="text"
                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        placeholder="New member name"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMember(teamName)}
                      />
                      <button onClick={() => handleAddMember(teamName)}>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Game Settings */}
        <div className="settings-section">
          <h2>Game Settings</h2>
          
          <div className="setting-item">
            <label>Quest Points:</label>
            <input
              type="number"
              value={settings.questPoints}
              onChange={(e) => setSettings(prev => ({ ...prev, questPoints: parseInt(e.target.value) || 0 }))}
              min="1"
              max="100"
            />
          </div>

          <div className="setting-item">
            <label>Master Password:</label>
            <input
              type="text"
              value={settings.masterPassword}
              onChange={(e) => setSettings(prev => ({ ...prev, masterPassword: e.target.value }))}
              placeholder="Master admin password"
            />
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.chatEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, chatEnabled: e.target.checked }))}
              />
              Enable team chat
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button 
            onClick={handleSaveSettings} 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button 
            onClick={handleResetToDefault} 
            className="reset-button"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 