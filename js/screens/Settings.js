import { navigateTo, AppState, saveSettings, showToast } from '../main.js';

export function initSettingsScreen() {
  const container = document.getElementById('screen-settings');
  container.innerHTML = `
    <div class="header">
        <button class="back-btn" id="settings-back-btn">Trở về</button>
        <div class="header-title">Cài Đặt</div>
    </div>
    
    <div class="glass-panel" style="padding: 20px;">
        <h3 class="section-title">Tên Người Chơi</h3>
        <div id="players-container"></div>

        <h3 class="section-title">Cài Đặt Điểm Số</h3>
        <div class="form-group row">
            <div class="col-50">
                <label>Hạng 2</label>
                <input type="number" id="set-rank2" class="input-control">
            </div>
            <div class="col-50">
                <label>Hạng 3</label>
                <input type="number" id="set-rank3" class="input-control">
            </div>
        </div>
        <div class="form-group row">
            <div class="col-50">
                <label>Hạng 4</label>
                <input type="number" id="set-rank4" class="input-control">
            </div>
            <div class="col-50">
                <label>Móm</label>
                <input type="number" id="set-mom" class="input-control">
            </div>
        </div>
        <div class="form-group row">
            <div class="col-50">
                <label>Ăn Chốt</label>
                <input type="number" id="set-chop" class="input-control">
            </div>
            <div class="col-50">
                <label>Phạt Ù</label>
                <input type="number" id="set-upenalty" class="input-control">
            </div>
        </div>
        <div class="form-group">
            <label>Phạt Ù Đền</label>
            <input type="number" id="set-udenpenalty" class="input-control">
        </div>

        <button class="btn btn-success" id="btn-save-settings" style="margin-top:20px;">Lưu Cài Đặt</button>
    </div>
  `;

  document.getElementById('settings-back-btn').addEventListener('click', () => {
    navigateTo('home');
  });

  document.getElementById('btn-save-settings').addEventListener('click', () => {
    // Save player names
    const playerInputs = document.querySelectorAll('.player-input');
    const newNames = [];
    playerInputs.forEach(input => newNames.push(input.value || 'Player'));
    AppState.settings.playerNames = newNames;

    // Save scores
    AppState.settings.scores.rank2 = parseInt(document.getElementById('set-rank2').value) || -10;
    AppState.settings.scores.rank3 = parseInt(document.getElementById('set-rank3').value) || -15;
    AppState.settings.scores.rank4 = parseInt(document.getElementById('set-rank4').value) || -20;
    AppState.settings.scores.mom = parseInt(document.getElementById('set-mom').value) || -25;
    AppState.settings.scores.chop = parseInt(document.getElementById('set-chop').value) || 20;
    AppState.settings.scores.uPenalty = parseInt(document.getElementById('set-upenalty').value) || -20;
    AppState.settings.scores.uDenPenalty = parseInt(document.getElementById('set-udenpenalty').value) || -30;

    saveSettings();
    showToast('Đã lưu cài đặt', 'success');
  });
}

export function renderSettingsScreen() {
    const { playerNames, scores } = AppState.settings;
    
    // Render Player inputs
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    playerNames.forEach((name, index) => {
        const fg = document.createElement('div');
        fg.className = 'form-group';
        fg.innerHTML = `
            <label>Người chơi ${index + 1}</label>
            <input type="text" class="input-control player-input" value="${name}">
        `;
        playersContainer.appendChild(fg);
    });

    // Populate scores
    document.getElementById('set-rank2').value = scores.rank2;
    document.getElementById('set-rank3').value = scores.rank3;
    document.getElementById('set-rank4').value = scores.rank4;
    document.getElementById('set-mom').value = scores.mom;
    document.getElementById('set-chop').value = scores.chop;
    document.getElementById('set-upenalty').value = scores.uPenalty;
    document.getElementById('set-udenpenalty').value = scores.uDenPenalty;
}
