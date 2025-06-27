import { useState, useEffect, useRef } from 'react'
import PlayerSelection from './PlayerSelection'
import Dashboard from './Dashboard'
import Gallery from './Gallery'
import './App.css'

const API_BASE = 'http://192.168.1.243:3001'

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(() => localStorage.getItem('selectedPlayer') || null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'gallery'

  // Upload state
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedType, setCapturedType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const galleryRef = useRef(null);

  async function fetchGameState() {
    try {
      const response = await fetch(`${API_BASE}/state`);
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      } else {
        console.error('Failed to fetch game state');
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGameState();
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    if (!selectedPlayer) return;
    const interval = setInterval(() => {
      fetchGameState();
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedPlayer]);

  useEffect(() => {
    localStorage.setItem('selectedPlayer', selectedPlayer || '');
  }, [selectedPlayer]);

  function handlePlayerSelect(name) {
    setSelectedPlayer(name);
    setLoading(true);
    fetchGameState();
  }

  function handleLogout() {
    setSelectedPlayer(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('selectedPlayer');
  }

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  // Get team color for navigation and FAB
  const getTeamByPlayer = (player, teams) => {
    for (const [teamName, team] of Object.entries(teams)) {
      if (team.members.includes(player)) {
        return team.color;
      }
    }
    return '#666';
  };
  const teamColor = selectedPlayer && gameState ? getTeamByPlayer(selectedPlayer, gameState.teams) : '#666';

  // File upload logic
  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      // Determine if it's photo or video based on file type
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' : 'photo';
      console.log('File selected from gallery:', file?.name, file?.size, file?.type);
      setCapturedFile(file);
      setCapturedType(type);
      setShowPreview(true);
    }
    // Reset the input
    event.target.value = '';
  }

  async function handleUpload() {
    if (!capturedFile) return;
    const formData = new FormData();
    formData.append('media', capturedFile);
    formData.append('player', selectedPlayer);
    formData.append('team', getTeamByPlayer(selectedPlayer, gameState.teams));
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setCapturedFile(null);
        setShowPreview(false);
        setCapturedType(null);
        fetchGameState();
        // Refresh gallery immediately after upload
        if (galleryRef.current && galleryRef.current.fetchGallery) {
          galleryRef.current.fetchGallery();
        }
        setCurrentPage('gallery');
      } else {
        console.error('Upload failed:', response.status);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  }

  function handleCancelPreview() {
    setCapturedFile(null);
    setShowPreview(false);
    setCapturedType(null);
  }

  if (loading || !gameState) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!selectedPlayer) {
    return <PlayerSelection onSelectPlayer={handlePlayerSelect} />
  }

  // Navigation component
  function Navigation({ currentPage, onPageChange, teamColor, onLogout, onUpload }) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #eee',
        padding: '0.5rem',
        zIndex: 1000
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem',
          maxWidth: 340,
          margin: '0 auto'
        }}>
          <button 
            onClick={() => onPageChange('dashboard')}
            style={{ 
              background: currentPage === 'dashboard' ? teamColor : '#f0f0f0', 
              color: currentPage === 'dashboard' ? 'white' : '#666', 
              border: 'none', 
              borderRadius: 12, 
              padding: '0.7rem 1.2rem', 
              fontSize: '0.9rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              boxShadow: '0 2px 8px #0002',
              flex: 1
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={onUpload}
            style={{ 
              background: teamColor, 
              color: 'white', 
              border: 'none', 
              borderRadius: 12, 
              padding: '0.7rem 0.8rem', 
              fontSize: '1.2rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              boxShadow: '0 2px 8px #0002'
            }}
          >
            +
          </button>
          <button 
            onClick={() => onPageChange('gallery')}
            style={{ 
              background: currentPage === 'gallery' ? teamColor : '#f0f0f0', 
              color: currentPage === 'gallery' ? 'white' : '#666', 
              border: 'none', 
              borderRadius: 12, 
              padding: '0.7rem 1.2rem', 
              fontSize: '0.9rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              boxShadow: '0 2px 8px #0002',
              flex: 1
            }}
          >
            📸 Gallery
          </button>
          <button 
            onClick={onLogout}
            style={{ 
              background: '#888', 
              color: 'white', 
              border: 'none', 
              borderRadius: 12, 
              padding: '0.7rem 0.8rem', 
              fontSize: '0.9rem', 
              cursor: 'pointer', 
              fontWeight: 700, 
              boxShadow: '0 2px 8px #0002'
            }}
          >
            👤
          </button>
        </div>
      </div>
    );
  }

  // Preview modal for captured media
  function PreviewModal() {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.25)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'white',
          borderRadius: 18,
          boxShadow: '0 4px 24px #0003',
          padding: '2rem 1.5rem',
          minWidth: 240,
          textAlign: 'center',
          position: 'relative',
        }}>
          <h2 style={{ color: teamColor, margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Preview</h2>
          <div style={{ margin: '1.2rem 0 0.5rem 0' }}>
            {capturedFile && (
              capturedType === 'photo' ? (
                <img
                  src={URL.createObjectURL(capturedFile)}
                  alt="Preview"
                  style={{ width: '100%', maxWidth: 320, borderRadius: 12, marginBottom: '0.7rem' }}
                />
              ) : (
                <video
                  src={URL.createObjectURL(capturedFile)}
                  controls
                  style={{ width: '100%', maxWidth: 320, borderRadius: 12, marginBottom: '0.7rem' }}
                />
              )
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={handleUpload}
                style={{
                  background: teamColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Upload
              </button>
              <button
                onClick={handleCancelPreview}
                style={{
                  background: '#888',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          player={selectedPlayer} 
          gameState={gameState} 
          onLogout={handleLogout} 
          onScoreUpdate={fetchGameState} 
        />
      )}
      {currentPage === 'gallery' && (
        <Gallery 
          player={selectedPlayer} 
          gameState={gameState} 
          onLogout={handleLogout} 
          onScoreUpdate={fetchGameState} 
          ref={galleryRef}
        />
      )}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        teamColor={teamColor}
        onLogout={handleLogout}
        onUpload={handleUploadClick}
      />
      {/* Preview modal after file selection */}
      {showPreview && <PreviewModal />}
    </div>
  );
}

export default App
