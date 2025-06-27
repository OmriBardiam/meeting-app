import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const Gallery = forwardRef(({ player, gameState, onLogout, onScoreUpdate }, ref) => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchGallery() {
    try {
      console.log('Fetching gallery from:', `${API_BASE}/gallery`);
      const response = await fetch(`${API_BASE}/gallery`);
      console.log('Gallery response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Gallery data received:', data);
        // Handle the backend response format: { files: [...] }
        const files = data.files || data;
        setGallery(files);
      } else {
        console.error('Failed to fetch gallery:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  }

  // Expose fetchGallery function to parent component
  useImperativeHandle(ref, () => ({
    fetchGallery
  }));

  // Fetch gallery data when component mounts
  useEffect(() => {
    console.log('Gallery component mounted, fetching data...');
    fetchGallery();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Gallery fetch timeout, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  // Refresh gallery data every 3 seconds to catch new uploads
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing gallery...');
      fetchGallery();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Find player's team for theming
  const getTeamByPlayer = (player, teams) => {
    for (const [teamName, team] of Object.entries(teams)) {
      if (team.members.includes(player)) {
        return { ...team, name: teamName };
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading gallery...
      </div>
    );
  }

  if (!gameState || !gameState.teams) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading game state...
      </div>
    );
  }

  const team = getTeamByPlayer(player, gameState.teams);
  if (!team) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Team not found.
      </div>
    );
  }

  if (gallery.length === 0) {
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
      }}>
        {/* Header */}
        <div style={{ width: '100%', maxWidth: 340, marginBottom: '1.2rem', background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: '1rem 0.7rem', textAlign: 'center', border: '1.5px solid #fff', backdropFilter: 'blur(2px)' }}>
          <h1 style={{ color: team.color, fontWeight: 800, fontSize: '1.4rem', margin: 0, textShadow: '0 2px 8px #0001' }}>Team Gallery</h1>
          <h2 style={{ color: '#222', fontWeight: 700, fontSize: '1.05rem', margin: '0.4rem 0 0.7rem 0' }}>Share Your Memories</h2>
          <button 
            onClick={fetchGallery}
            style={{
              background: team.color,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: '0.5rem'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Empty State */}
        <div style={{ 
          width: '100%', 
          maxWidth: 340, 
          background: 'rgba(255,255,255,0.85)', 
          borderRadius: 16, 
          boxShadow: '0 2px 8px #0001', 
          padding: '2rem 1rem', 
          marginBottom: '1.2rem', 
          border: '1.5px solid #fff', 
          backdropFilter: 'blur(2px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
            No media uploaded yet! 📸
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>
            Use the + button to add photos and videos.
          </div>
        </div>
      </div>
    );
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
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 340, marginBottom: '1.2rem', background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: '1rem 0.7rem', textAlign: 'center', border: '1.5px solid #fff', backdropFilter: 'blur(2px)' }}>
        <h1 style={{ color: team.color, fontWeight: 800, fontSize: '1.4rem', margin: 0, textShadow: '0 2px 8px #0001' }}>Team Gallery</h1>
        <h2 style={{ color: '#222', fontWeight: 700, fontSize: '1.05rem', margin: '0.4rem 0 0.7rem 0' }}>Share Your Memories</h2>
        <button 
          onClick={fetchGallery}
          style={{
            background: team.color,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '0.5rem'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Gallery - Pinterest Style */}
      <div style={{ 
        width: '100%', 
        maxWidth: 340, 
        background: 'rgba(255,255,255,0.85)', 
        borderRadius: 16, 
        boxShadow: '0 2px 8px #0001', 
        padding: '0.7rem 0.5rem', 
        marginBottom: '1.2rem', 
        border: '1.5px solid #fff', 
        backdropFilter: 'blur(2px)',
        minHeight: '400px'
      }}>
        <h3 style={{ margin: 0, color: team.color, fontWeight: 700, fontSize: '0.98rem', letterSpacing: '0.01em', textAlign: 'center', marginBottom: '0.7rem' }}>Team Memories</h3>
        
        <div style={{ 
          columnCount: 2, 
          columnGap: '0.5rem',
          padding: '0 0.5rem'
        }}>
          {gallery.map((filePath, index) => {
            // Extract filename from path (e.g., "/uploads/filename.jpg" -> "filename.jpg")
            const filename = filePath.split('/').pop();
            const fullUrl = `${API_BASE}${filePath}`;
            const isVideo = filename.toLowerCase().endsWith('.mov') || 
                           filename.toLowerCase().endsWith('.mp4') ||
                           filename.toLowerCase().endsWith('.avi') ||
                           filename.toLowerCase().endsWith('.webm');
            
            return (
              <div key={index} style={{ 
                breakInside: 'avoid',
                marginBottom: '0.5rem',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 8px #0002',
                background: 'white',
                border: '1px solid #eee'
              }}>
                {isVideo ? (
                  <video
                    src={fullUrl}
                    controls
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                ) : (
                  <img
                    src={fullUrl}
                    alt={filename}
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default Gallery 