import { initHomeScreen } from './screens/Home.js';
import { initGameScreen } from './screens/Game.js';
import { initSettingsScreen } from './screens/Settings.js';
import { initAdviseScreen } from './screens/Advise.js';
import { saveSettingsToFB, loadSettingsFromFB, saveHistoryToFB, loadHistoryFromFB } from './firebase-service.js';

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

// Firebase Wrappers
export async function loadSettings() {
  const saved = await loadSettingsFromFB();
  if (saved) {
    AppState.settings = saved;
  } else {
    AppState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    await saveSettings();
  }
}

export async function saveSettings() {
  await saveSettingsToFB(AppState.settings);
}

export async function loadHistory() {
  const saved = await loadHistoryFromFB();
  if (saved) {
    AppState.history = saved;
  } else {
    AppState.history = [];
  }
}

export async function saveHistory() {
  await saveHistoryToFB(AppState.history);
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
document.addEventListener('DOMContentLoaded', async () => {
  // Show loading toast
  showToast('Dang ket noi Cloud...', 'info');

  await loadSettings();
  await loadHistory();
  
  // Inject screens structure
  initHomeScreen();
  initSettingsScreen();
  initAdviseScreen();
  initGameScreen();
  
  // Start at home
  navigateTo('home');
  showToast('Da tai xong du lieu!', 'success');
});
