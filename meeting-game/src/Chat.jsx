import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { WS_BASE, getPlayerAvatar } from './config';

// Debug logging
console.log('WebSocket URL:', WS_BASE);
console.log('Current hostname:', window.location.hostname);

export default function Chat({ player, teamName, teamColor }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('Attempting WebSocket connection to:', WS_BASE);
    console.log('Current hostname:', window.location.hostname);
    
    // Connect to WebSocket
    const newSocket = io(WS_BASE, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      
      // Join team room
      newSocket.emit('join-team', { player, teamName });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Re-join team room after reconnection
      newSocket.emit('join-team', { player, teamName });
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      setIsConnected(false);
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
    return isConnected ? '#4CAF50' : '#F44336';
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 320,
      marginBottom: '1rem',
      background: 'rgba(255,255,255,0.9)',
      borderRadius: 16,
      boxShadow: '0 2px 12px #0002',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      flexDirection: 'column',
      height: '350px',
      padding: '0.8rem'
    }}>
      {/* Chat Header */}
      <div style={{
        background: teamColor,
        color: 'white',
        padding: '1rem 0.8rem',
        borderRadius: '16px 16px 0 0',
        fontWeight: 700,
        textAlign: 'center',
        fontSize: '1.1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '44px',
        boxSizing: 'border-box'
      }}>
        <span>💬 Team Chat</span>
        <div style={{
          fontSize: '0.9rem',
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          minHeight: '20px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: getConnectionStatusColor()
          }}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        minHeight: '200px'
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
              padding: '0.8rem 1rem',
              borderRadius: 12,
              maxWidth: '85%',
              wordBreak: 'break-word',
              minHeight: '44px',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{getPlayerAvatar(msg.player)}</span>
                <span>{msg.player}</span> • {formatTime(msg.timestamp)}
              </div>
              <div style={{ fontSize: '1rem', lineHeight: '1.4' }}>{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={{
        padding: '0.8rem',
        borderTop: '1px solid #eee',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              minHeight: '40px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '0.7rem 1rem',
              background: teamColor,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              opacity: newMessage.trim() ? 1 : 0.5,
              fontSize: '0.95rem',
              minHeight: '40px',
              minWidth: '50px',
              boxSizing: 'border-box',
              flexShrink: 0
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 