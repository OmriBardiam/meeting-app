// Centralized configuration for the Drunksters app

// API Base URL configuration
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : window.location.hostname.includes('github.io')
    ? 'https://34dcc856-e079-4a62-b5bf-cbc59c500ff0.up.railway.app'
    : 'https://34dcc856-e079-4a62-b5bf-cbc59c500ff0.up.railway.app');

// Debug logging
console.log('Current hostname:', window.location.hostname);
console.log('API Base URL:', API_BASE);

// Other configuration constants
export const APP_NAME = 'Drunksters';
export const APP_VERSION = '1.0.0';

// Player avatars mapping
export const playerAvatars = {
  Keniya: "🦄",
  Pita: "🐼",
  Misha: "🦁",
  Roni: "🐰",
  Omri: "🦊",
  Meitav: "🐸",
  Jules: "🐵",
  Tetro: "🐻",
  Idan: "🐨",
  Yoad: "🐯",
  Segev: "🦒",
}; 