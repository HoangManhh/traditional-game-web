import { initHomeScreen } from './screens/Home.js';
import { initGameScreen } from './screens/Game.js';
import { initSettingsScreen } from './screens/Settings.js';
import { initAdviseScreen } from './screens/Advise.js';
import { saveSettingsRemote, loadSettingsRemote, saveHistoryRemote, loadHistoryRemote } from './api-service.js';

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

// Server API Wrappers (load* throw on failure, save* return true/false)
export async function loadSettings() {
  const saved = await loadSettingsRemote();
  AppState.settings = saved || JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

export async function saveSettings() {
  return saveSettingsRemote(AppState.settings);
}

export async function loadHistory() {
  const saved = await loadHistoryRemote();
  AppState.history = saved || [];
}

export async function saveHistory() {
  return saveHistoryRemote(AppState.history);
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

  try {
    await loadSettings();
    await loadHistory();
  } catch (error) {
    // Do not start with empty data: the next save would overwrite the real history.
    console.error('Load data error: ', error);
    document.getElementById('screen-home').innerHTML = `
      <div class="glass-panel" style="padding: 30px; text-align: center; margin: auto 0;">
        <p style="margin-bottom: 20px;">Khong tai duoc du lieu tu server.</p>
        <button class="btn btn-primary" id="btn-reload">Tai lai</button>
      </div>
    `;
    document.getElementById('btn-reload').addEventListener('click', () => location.reload());
    showToast('Loi ket noi server', 'error');
    return;
  }

  // Inject screens structure
  initHomeScreen();
  initSettingsScreen();
  initAdviseScreen();
  initGameScreen();
  
  // Start at home
  navigateTo('home');
  showToast('Da tai xong du lieu!', 'success');
});
