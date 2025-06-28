import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// WebSocket URL configuration
const WS_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://meeting-app-backend-hh3f.onrender.com'
    : 'https://meeting-app-backend-hh3f.onrender.com');

// Debug logging
console.log('WebSocket URL:', WS_URL);
console.log('Current hostname:', window.location.hostname);

function Chat({ player, teamName, teamColor }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('Attempting WebSocket connection to:', WS_URL);
    
    // Connect to WebSocket
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setConnectionStatus('connected');
      
      // Join team room
      newSocket.emit('join-team', { player, teamName });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    });

    // Chat event handlers
    newSocket.on('chat-history', (history) => {
      console.log('Received chat history:', history);
      setMessages(history);
    });

    newSocket.on('new-message', (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.close();
    };
  }, [player, teamName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      message: newMessage.trim(),
      player,
      teamName
    });

    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FFC107';
      default: return '#F44336';
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.9)',
      borderRadius: 16,
      boxShadow: '0 2px 12px #0002',
      border: '1.5px solid #fff',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px',
      maxWidth: '400px',
      width: '100%'
    }}>
      {/* Chat Header */}
      <div style={{
        background: teamColor,
        color: 'white',
        padding: '0.8rem',
        borderRadius: '16px 16px 0 0',
        fontWeight: 700,
        textAlign: 'center',
        fontSize: '1.1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>💬 Team Chat</span>
        <div style={{
          fontSize: '0.8rem',
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getConnectionStatusColor()
          }}></div>
          {connectionStatus}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.player === player ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              background: msg.player === player ? teamColor : '#f0f0f0',
              color: msg.player === player ? 'white' : '#333',
              padding: '0.5rem 0.8rem',
              borderRadius: 12,
              maxWidth: '80%',
              wordBreak: 'break-word'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                {msg.player} • {formatTime(msg.timestamp)}
              </div>
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={{
        padding: '1rem',
        borderTop: '1px solid #eee'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '0.6rem 1rem',
              background: teamColor,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              opacity: newMessage.trim() ? 1 : 0.5
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat; 