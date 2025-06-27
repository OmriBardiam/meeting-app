# Meeting Game App

A full-stack web application for team-based meeting games with real-time scoring, quests, and media sharing.

## 🎮 Features

- **Team Management**: Two teams with customizable members and colors
- **Real-time Scoring**: Live score updates with admin controls
- **Secret Quests**: Team-specific quests with point rewards
- **Media Gallery**: Photo and video sharing with Pinterest-style layout
- **Responsive Design**: Mobile-first design with modern UI
- **Real-time Updates**: Automatic polling for live data

## 🏗️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **File Upload**: Multer
- **Styling**: CSS-in-JS with modern design
- **Deployment**: GitHub Actions + Vercel + Render

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

1. **Vercel Account** (for frontend)
2. **Render Account** (for backend)
3. **GitHub Repository** (already set up)

### Setup Steps

#### 1. Deploy Backend to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New Web Service" → Connect your GitHub repo
3. Configure the service:
   - **Name**: `meeting-app-backend`
   - **Root Directory**: `meeting-game-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment**: Node
4. Deploy and note the service URL (e.g., `https://meeting-app-backend.onrender.com`)

#### 2. Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `meeting-game`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your Render backend URL (e.g., `https://meeting-app-backend.onrender.com`)
5. Deploy

#### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

**For Backend (Render):**
- `RENDER_TOKEN`: Your Render API token
- `RENDER_SERVICE_ID`: Your Render service ID

**For Frontend (Vercel):**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VITE_API_BASE_URL`: Your backend URL

### Automatic Deployment

The GitHub Actions workflows will automatically deploy your app when you push to the `main` branch:

- `deploy-backend.yml`: Deploys backend changes to Render
- `deploy-frontend.yml`: Deploys frontend changes to Vercel
- `deploy-all.yml`: Deploys both frontend and backend together

## 📁 Project Structure

```
meeting-app/
├── meeting-game/          # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── Dashboard.jsx # Team dashboard
│   │   ├── Gallery.jsx   # Media gallery
│   │   └── ...
│   └── package.json
├── meeting-game-backend/  # Node.js backend
│   ├── index.js          # Express server
│   ├── uploads/          # Media storage
│   └── package.json
└── .github/workflows/    # GitHub Actions
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend-url.com
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
      members: ["Keniya", "Pita", "Misha", "Roni", "Omri"],
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
3. **Gallery**: Browse and upload team photos/videos
4. **Admin Controls**: Team admins can update scores and manage quests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy gaming! 🎮✨**