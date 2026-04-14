import { initHomeScreen } from './screens/Home.js';
import { initGameScreen } from './screens/Game.js';
import { initSettingsScreen } from './screens/Settings.js';
import { initAdviseScreen } from './screens/Advise.js';

// Globals for App State
export const AppState = {
  settings: null,
  history: [],
};

const DEFAULT_SETTINGS = {
  playerNames: ['Uyen', 'Quyen', 'Thuong', 'Trang'],
  scores: {
    rank2: -10,
    rank3: -15,
    rank4: -20,
    mom: -25,
    chop: 20,
    uPenalty: -20,
    uDenPenalty: -30,
  },
};

// Navigation
export function navigateTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    // Trigger lifecycle if needed
    if (screenId === 'game') {
      import('./screens/Game.js').then(module => module.renderGameScreen());
    } else if (screenId === 'settings') {
      import('./screens/Settings.js').then(module => module.renderSettingsScreen());
    }
  }
}

// Local Storage Wrappers
export function loadSettings() {
  const saved = localStorage.getItem('traditionalGameSettings');
  if (saved) {
    try {
      AppState.settings = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing settings', e);
      AppState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  } else {
    AppState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    saveSettings();
  }
}

export function saveSettings() {
  localStorage.setItem('traditionalGameSettings', JSON.stringify(AppState.settings));
}

export function loadHistory() {
  const saved = localStorage.getItem('traditionalGameHistory');
  if (saved) {
    try {
      AppState.history = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing history', e);
      AppState.history = [];
    }
  } else {
    AppState.history = [];
  }
}

export function saveHistory() {
  localStorage.setItem('traditionalGameHistory', JSON.stringify(AppState.history));
}

// Toast Notifications
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadHistory();
  
  // Inject screens structure
  initHomeScreen();
  initSettingsScreen();
  initAdviseScreen();
  initGameScreen();
  
  // Start at home
  navigateTo('home');
});
