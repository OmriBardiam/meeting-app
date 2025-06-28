const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let gameState = {
  teams: {
    "Team Omri": {
      color: '#1976d2',
      members: ["Keniya", "Pita", "Misha", "Roni", "Omri", "Segev"],
      score: 0,
      admin: "Omri",
    },
    "Team Yoad": {
      color: '#d32f2f',
      members: ["Meitav", "Jules", "Tetro", "Idan", "Yoad"],
      score: 0,
      admin: "Yoad",
    },
  },
  quests: {
    "Team Omri": [
      { id: 1, text: "Secret Quest 1", completed: false },
      { id: 2, text: "Secret Quest 2", completed: false },
    ],
    "Team Yoad": [
      { id: 1, text: "Secret Quest 1", completed: false },
      { id: 2, text: "Secret Quest 2", completed: false },
    ],
  }
};

// Chat storage
let teamChats = {
  "Team Omri": [],
  "Team Yoad": []
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join team room
  socket.on('join-team', ({ player, teamName }) => {
    console.log(`Join team request: ${player} wants to join ${teamName}`);
    socket.join(teamName);
    socket.player = player;
    socket.teamName = teamName;
    console.log(`${player} joined ${teamName}`);
    
    // Send existing chat messages
    const chatHistory = teamChats[teamName] || [];
    console.log(`Sending ${chatHistory.length} messages to ${player}`);
    socket.emit('chat-history', chatHistory);
  });

  // Handle chat messages
  socket.on('send-message', ({ message, player, teamName }) => {
    console.log(`Message from ${player} in ${teamName}: ${message}`);
    const chatMessage = {
      id: Date.now(),
      player,
      message,
      timestamp: new Date().toISOString(),
      teamName
    };
    
    // Store message
    if (!teamChats[teamName]) {
      teamChats[teamName] = [];
    }
    teamChats[teamName].push(chatMessage);
    
    // Keep only last 50 messages per team
    if (teamChats[teamName].length > 50) {
      teamChats[teamName] = teamChats[teamName].slice(-50);
    }
    
    // Broadcast to team
    console.log(`Broadcasting message to ${teamName}`);
    io.to(teamName).emit('new-message', chatMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Chat API endpoints
app.get('/chat/:teamName', (req, res) => {
  const { teamName } = req.params;
  res.json(teamChats[teamName] || []);
});

app.post('/chat/:teamName', (req, res) => {
  const { teamName } = req.params;
  const { player, message } = req.body;
  
  if (!teamChats[teamName]) {
    teamChats[teamName] = [];
  }
  
  const chatMessage = {
    id: Date.now(),
    player,
    message,
    timestamp: new Date().toISOString(),
    teamName
  };
  
  teamChats[teamName].push(chatMessage);
  
  // Keep only last 50 messages
  if (teamChats[teamName].length > 50) {
    teamChats[teamName] = teamChats[teamName].slice(-50);
  }
  
  res.json(chatMessage);
});

// Routes
app.get('/state', (req, res) => {
  res.json(gameState);
});

app.post('/score', (req, res) => {
  const { teamName, delta, admin } = req.body;
  
  // Validate admin
  if (!gameState.teams[teamName] || gameState.teams[teamName].admin !== admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Update score
  gameState.teams[teamName].score += delta;
  
  res.json({ success: true, newScore: gameState.teams[teamName].score });
});

app.post('/quest', (req, res) => {
  const { teamName, questId, admin } = req.body;
  
  // Validate admin
  if (!gameState.teams[teamName] || gameState.teams[teamName].admin !== admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Find and update quest
  const quest = gameState.quests[teamName].find(q => q.id === questId);
  if (quest) {
    quest.completed = !quest.completed;
    // Add or remove 10 points
    if (quest.completed) {
      gameState.teams[teamName].score += 10;
    } else {
      gameState.teams[teamName].score -= 10;
    }
    res.json({ success: true, quest, newScore: gameState.teams[teamName].score });
  } else {
    res.status(404).json({ error: 'Quest not found' });
  }
});

app.delete('/quest', (req, res) => {
  const { teamName, questId, admin } = req.body;
  if (!gameState.teams[teamName] || gameState.teams[teamName].admin !== admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const quests = gameState.quests[teamName];
  const idx = quests.findIndex(q => q.id === questId);
  if (idx !== -1) {
    const [removed] = quests.splice(idx, 1);
    // If quest was completed, remove the points
    if (removed.completed) {
      gameState.teams[teamName].score -= 10;
    }
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Quest not found' });
  }
});

app.patch('/quest', (req, res) => {
  const { teamName, questId, text, admin } = req.body;
  if (!gameState.teams[teamName] || gameState.teams[teamName].admin !== admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Invalid quest text' });
  }
  const quest = gameState.quests[teamName].find(q => q.id === questId);
  if (quest) {
    quest.text = text.trim();
    res.json({ success: true, quest });
  } else {
    res.status(404).json({ error: 'Quest not found' });
  }
});

app.post('/reset', (req, res) => {
  // Reset scores and quests
  Object.keys(gameState.teams).forEach(teamName => {
    gameState.teams[teamName].score = 0;
  });
  
  Object.keys(gameState.quests).forEach(teamName => {
    gameState.quests[teamName].forEach(quest => {
      quest.completed = false;
    });
  });
  
  res.json({ success: true });
});

app.put('/quest', (req, res) => {
  const { teamName, text, admin } = req.body;
  if (!gameState.teams[teamName] || gameState.teams[teamName].admin !== admin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Invalid quest text' });
  }
  const quests = gameState.quests[teamName];
  const newId = quests.length > 0 ? Math.max(...quests.map(q => q.id)) + 1 : 1;
  const newQuest = { id: newId, text: text.trim(), completed: false };
  quests.push(newQuest);
  res.json({ success: true, quest: newQuest });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 