# Meeting Game App

A full-stack web application for team-based meeting games with real-time scoring and quests.

## 🎮 Features

- **Team Management**: Two teams with customizable members and colors
- **Real-time Scoring**: Live score updates with admin controls
- **Secret Quests**: Team-specific quests with point rewards
- **Real-time Chat**: WebSocket-based team chat
- **Responsive Design**: Mobile-first design with modern UI
- **Real-time Updates**: Automatic polling for live data

## 🏗️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **Styling**: CSS-in-JS with modern design
- **Deployment**: GitHub Actions + Railway (Backend) + GitHub Pages (Frontend)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/OmriBardiam/meeting-app.git
   cd meeting-app
   ```

2. **Start the backend**
   ```bash
   cd meeting-game-backend
   npm install
   npm start
   ```

3. **Start the frontend**
   ```bash
   cd meeting-game
   npm install
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 🌐 Deployment

### Prerequisites

1. **Railway Account** (for backend) - Much faster than Render!
2. **GitHub Repository** (already set up)

### Setup Steps

#### 1. Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and configure:
   - **Root Directory**: `meeting-game-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Deploy and note the service URL (e.g., `https://your-app.railway.app`)

#### 2. Set up GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `RAILWAY_TOKEN`: Your Railway API token (get from Railway dashboard)
- `RAILWAY_SERVICE`: Your Railway service name

### Automatic Deployment

The GitHub Actions workflows will automatically deploy your app when you push to the `main` branch:

- `deploy-backend.yml`: Deploys backend changes to Railway
- `deploy.yml`: Deploys frontend to GitHub Pages

## 📁 Project Structure

```
meeting-app/
├── meeting-game/          # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── Dashboard.jsx # Team dashboard
│   │   ├── PlayerSelection.jsx # Player selection screen
│   │   ├── Chat.jsx      # Real-time chat component
│   │   └── ...
│   └── package.json
├── meeting-game-backend/  # Node.js backend
│   ├── index.js          # Express server with Socket.io
│   ├── railway.json      # Railway deployment config
│   └── package.json
└── .github/workflows/    # GitHub Actions
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-railway-url.com
```

**Backend:**
```env
PORT=3001
```

### Team Configuration

Edit `meeting-game-backend/index.js` to customize teams:

```javascript
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
  // ...
};
```

## 📱 Usage

1. **Select Player**: Choose your name from the team list
2. **Dashboard**: View team scores, members, and quests
3. **Admin Controls**: Team admins can update scores and manage quests
4. **Real-time Chat**: Chat with your team members
5. **Real-time Updates**: Scores, quests, and chat update automatically

## 🚀 Why Railway over Render?

- **Faster deployments** (30 seconds vs 5+ minutes)
- **Better free tier** ($5/month credit vs limited free hours)
- **More reliable** (less downtime)
- **Better developer experience** (faster CLI, better logs)
- **Global edge deployment** (faster worldwide access)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy gaming! 🎮✨**