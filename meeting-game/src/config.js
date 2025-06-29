// Centralized configuration for the Drunksters app

// API Base URL configuration - simple localhost or production
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001' 
    : 'https://meeting-app-production-3afd.up.railway.app');

// WebSocket URL configuration - simple localhost or production
export const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'ws://localhost:3001'
    : 'wss://meeting-app-production-3afd.up.railway.app');

// Debug logging
console.log('Current hostname:', window.location.hostname);
console.log('API Base URL:', API_BASE);
console.log('WebSocket Base URL:', WS_BASE);

// Other configuration constants
export const APP_NAME = 'Drunksters';
export const APP_VERSION = '1.0.0';

// Responsive Design Constants
export const LAYOUT = {
  // Container widths for different screen sizes
  MOBILE_MAX_WIDTH: '95vw',
  TABLET_MAX_WIDTH: '600px',
  DESKTOP_MAX_WIDTH: '800px',
  
  // Padding and spacing
  MOBILE_PADDING: '1rem',
  TABLET_PADDING: '1.5rem',
  DESKTOP_PADDING: '2rem',
  
  // Component spacing
  SECTION_GAP: '1.5rem',
  ITEM_GAP: '1rem',
  SMALL_GAP: '0.5rem',
  
  // Border radius
  BORDER_RADIUS: 16,
  SMALL_BORDER_RADIUS: 8,
  
  // Shadows
  CARD_SHADOW: '0 2px 12px #0002',
  BUTTON_SHADOW: '0 1px 4px #0002',
  
  // Background opacity
  CARD_BG_OPACITY: 0.85,
  SECTION_BG_OPACITY: 0.7,
  ITEM_BG_OPACITY: 0.5,
};

// Media query breakpoints
export const BREAKPOINTS = {
  MOBILE: '480px',
  TABLET: '768px',
  DESKTOP: '1024px',
};

// Emoji set for avatars
const EMOJI_SET = [
  "🦄", "🐼", "🦁", "🐰", "🦊", "🐸", "🐵", "🐻", "🐨", "🐯", "🦒", "🦓", "🦔", "🦦", "🦥", "🦜", "🦩", "🦚", "🦢", "🦤", "🦭", "🦈", "🦑", "🦞", "🦀", "🦋", "🐙", "🐬", "🐳", "🐋", "🦕", "🦖",
  "🐶", "🐱", "🐭", "🐹", "🐮", "🐷", "🐽", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
  "🦘", "🦡", "🦃", "🦚", "🦜", "🦢", "🦩", "🦨", "🦝", "🦙", "🦒", "🦘", "🦡", "🦃", "🦚", "🦜", "🦢", "🦩", "🦨", "🦝"
];

// Get consistent avatar for a player based on their name
export function getPlayerAvatar(playerName) {
  // Create a simple hash of the player name to get consistent emoji
  let hash = 0;
  for (let i = 0; i < playerName.length; i++) {
    const char = playerName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % EMOJI_SET.length;
  return EMOJI_SET[index];
}