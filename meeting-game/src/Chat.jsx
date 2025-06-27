import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://meeting-app-backend-hh3f.onrender.com');

function Chat({ player, teamName, teamColor }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    // Join team room
    newSocket.emit('join-team', { player, teamName });

    // Listen for chat history
    newSocket.on('chat-history', (history) => {
      setMessages(history);
    });

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
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
        fontSize: '1.1rem'
      }}>
        💬 Team Chat
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