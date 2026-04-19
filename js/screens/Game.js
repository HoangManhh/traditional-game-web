import { navigateTo, AppState, saveHistory, showToast } from '../main.js';

let isUMode = false;
let isUDenMode = false;
let chopPairs = [];
let uDenPairs = [];
let uPlayerIndex = '';

// Edit Modal State
let isEditMode = false;
let editRoundIndex = null;
let editRanks = [];

let scoreChart = null;

export function initGameScreen() {
  const container = document.getElementById('screen-game');
  container.innerHTML = `
    <div class="header">
        <button class="back-btn" id="game-back-btn">Trở về</button>
        <div class="header-title">Tính Điểm</div>
    </div>
    
    <div class="glass-panel" style="padding: 20px; overflow-y: auto; max-height: calc(100vh - 100px);">
        <div class="mode-toggle">
            <button class="mode-btn" id="btn-u-mode">Chế độ Ù</button>
            <button class="mode-btn" id="btn-uden-mode">Chế độ Ù Đền</button>
        </div>

        <div id="rank-inputs-container">
            <h3 class="section-title">Nhập Xếp Hạng Vòng Hiện Tại</h3>
            <div id="rank-players-list"></div>
        </div>

        <div id="u-input-container" style="display: none;">
            <h3 class="section-title">Chọn Người Ù</h3>
            <select class="input-control" id="u-player-select"></select>
        </div>

        <h3 class="section-title">Nhập Ăn Chốt</h3>
        <div class="form-group row align-center gap-10">
            <div class="col-50" style="padding:0">
                <select class="input-control" id="chop-eater"></select>
            </div>
            <div class="col-50" style="padding:0">
                <select class="input-control" id="chop-eaten"></select>
            </div>
        </div>
        <div class="d-flex gap-10" style="margin-bottom:15px;">
            <button class="btn btn-primary btn-small" id="btn-add-chop">Thêm</button>
            <button class="btn btn-danger btn-small" id="btn-clear-chop" style="display:none;">Xóa tất cả</button>
        </div>
        <div id="chop-list" class="card-list" style="margin-bottom:10px;"></div>

        <div id="uden-input-container" style="display: none;">
            <h3 class="section-title">Nhập Ù Đền</h3>
            <div class="form-group row align-center gap-10">
                <div class="col-50" style="padding:0">
                    <select class="input-control" id="uden-player"></select>
                </div>
                <div class="col-50" style="padding:0">
                    <select class="input-control" id="uden-victim"></select>
                </div>
            </div>
            <div class="d-flex gap-10" style="margin-bottom:15px;">
                <button class="btn btn-primary btn-small" id="btn-add-uden">Thêm</button>
                <button class="btn btn-danger btn-small" id="btn-clear-uden" style="display:none;">Xóa tất cả</button>
            </div>
            <div id="uden-list" class="card-list" style="margin-bottom:10px;"></div>
        </div>

        <button class="btn btn-success" id="btn-calculate" style="margin-top:20px;">Tính Điểm</button>
        <button class="btn btn-danger" id="btn-reset">Reset Trò Chơi</button>

        <h3 class="section-title">Bảng Điểm</h3>
        <div class="table-wrapper">
            <table id="history-table">
                <thead>
                    <tr id="history-header"></tr>
                </thead>
                <tbody id="history-body"></tbody>
            </table>
        </div>

        <div id="chart-container" style="display: none; margin-top: 20px; margin-bottom: 30px;">
            <h3 class="section-title">Biểu Đồ Theo Dõi</h3>
            <div class="glass-panel" style="padding: 10px;">
                <canvas id="score-chart"></canvas>
            </div>
        </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
    document.getElementById('game-back-btn').addEventListener('click', () => navigateTo('home'));
    
    const uiUModeBtn = document.getElementById('btn-u-mode');
    const uiUDenModeBtn = document.getElementById('btn-uden-mode');
    
    uiUModeBtn.addEventListener('click', () => {
        isUMode = !isUMode;
        if (isUMode) {
            isUDenMode = false;
            uPlayerIndex = '';
            uDenPairs = [];
        }
        updateUIState();
    });

    uiUDenModeBtn.addEventListener('click', () => {
        isUDenMode = !isUDenMode;
        if (isUDenMode) {
            isUMode = false;
            uPlayerIndex = '';
            uDenPairs = [];
        }
        updateUIState();
    });

    document.getElementById('btn-add-chop').addEventListener('click', () => {
        const eater = document.getElementById('chop-eater').value;
        const eaten = document.getElementById('chop-eaten').value;
        if (!eater || !eaten) return showToast('Vui lòng chọn đủ người ăn và bị ăn', 'error');
        if (eater === eaten) return showToast('Không thể ăn chốt chính mình', 'error');
        chopPairs.push({ eater: parseInt(eater), eaten: parseInt(eaten) });
        document.getElementById('chop-eater').value = '';
        document.getElementById('chop-eaten').value = '';
        renderChopPairs();
    });

    document.getElementById('btn-clear-chop').addEventListener('click', () => {
        chopPairs = [];
        renderChopPairs();
    });

    document.getElementById('btn-add-uden').addEventListener('click', () => {
        const uDen = document.getElementById('uden-player').value;
        const victim = document.getElementById('uden-victim').value;
        if (!uDen || !victim) return showToast('Vui lòng chọn đủ người Ù Đền và bị Ù Đền', 'error');
        if (uDen === victim) return showToast('Không thể Ù Đền chính mình', 'error');
        uDenPairs.push({ uDenPlayer: parseInt(uDen), uDenVictim: parseInt(victim) });
        document.getElementById('uden-player').value = '';
        document.getElementById('uden-victim').value = '';
        renderUDenPairs();
    });

    document.getElementById('btn-clear-uden').addEventListener('click', () => {
        uDenPairs = [];
        renderUDenPairs();
    });

    document.getElementById('btn-calculate').addEventListener('click', calculateScores);
    document.getElementById('btn-reset').addEventListener('click', async () => {
        if (confirm('Bạn có chắc muốn reset trò chơi?')) {
            AppState.history = [];
            showToast('Dang reset Cloud...', 'info');
            await saveHistory();
            resetRoundInputs();
            renderHistory();
            showToast('Đã reset trò chơi', 'success');
        }
    });

    document.getElementById('u-player-select').addEventListener('change', (e) => {
        uPlayerIndex = e.target.value;
    });

    // Delegate remove logic for chops and udens
    document.getElementById('chop-list').addEventListener('click', e => {
        if (e.target.classList.contains('remove-chop')) {
            const idx = e.target.getAttribute('data-idx');
            chopPairs.splice(idx, 1);
            renderChopPairs();
        }
    });

    document.getElementById('uden-list').addEventListener('click', e => {
        if (e.target.classList.contains('remove-uden')) {
            const idx = e.target.getAttribute('data-idx');
            uDenPairs.splice(idx, 1);
            renderUDenPairs();
        }
    });
}

function updateUIState() {
    const btnU = document.getElementById('btn-u-mode');
    const btnUDen = document.getElementById('btn-uden-mode');
    
    btnU.classList.toggle('active', isUMode);
    btnUDen.classList.toggle('active', isUDenMode);

    document.getElementById('rank-inputs-container').style.display = (!isUMode && !isUDenMode) ? 'block' : 'none';
    document.getElementById('u-input-container').style.display = isUMode ? 'block' : 'none';
    document.getElementById('uden-input-container').style.display = isUDenMode ? 'block' : 'none';
    
    renderUDenPairs();
}

export function renderGameScreen() {
    const names = AppState.settings.playerNames;
    
    // Ranks
    const rankContainer = document.getElementById('rank-players-list');
    rankContainer.innerHTML = '';
    const selectOptions = `<option value="">Chọn</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">Móm</option>`;
    
    names.forEach((name, i) => {
        rankContainer.innerHTML += `
            <div class="form-group row align-center">
                <div class="col-50"><label>${name}</label></div>
                <div class="col-50">
                    <select class="input-control rank-select" data-idx="${i}">${selectOptions}</select>
                </div>
            </div>
        `;
    });

    // Populate Selects
    const uPlayerSelect = document.getElementById('u-player-select');
    const chopEater = document.getElementById('chop-eater');
    const chopEaten = document.getElementById('chop-eaten');
    const uDenPlayer = document.getElementById('uden-player');
    const uDenVictim = document.getElementById('uden-victim');

    const opts = `<option value="">Chọn</option>` + names.map((n, i) => `<option value="${i}">${n}</option>`).join('');
    
    uPlayerSelect.innerHTML = opts;
    chopEater.innerHTML = opts;
    chopEaten.innerHTML = opts;
    uDenPlayer.innerHTML = `<option value="">Người Ù Đền</option>` + names.map((n, i) => `<option value="${i}">${n}</option>`).join('');
    uDenVictim.innerHTML = `<option value="">Người bị Ù Đền</option>` + names.map((n, i) => `<option value="${i}">${n}</option>`).join('');

    renderHistory();
    resetRoundInputs();
}

function renderChopPairs() {
    const names = AppState.settings.playerNames;
    const list = document.getElementById('chop-list');
    list.innerHTML = '';
    chopPairs.forEach((pair, idx) => {
        list.innerHTML += `
            <div class="card-item glass-panel">
                <span>${names[pair.eater]} → ${names[pair.eaten]}</span>
                <button class="btn btn-danger btn-small remove-chop" data-idx="${idx}">Xóa</button>
            </div>
        `;
    });
    document.getElementById('btn-clear-chop').style.display = chopPairs.length > 0 ? 'inline-block' : 'none';
}

function renderUDenPairs() {
    const names = AppState.settings.playerNames;
    const list = document.getElementById('uden-list');
    list.innerHTML = '';
    uDenPairs.forEach((pair, idx) => {
        list.innerHTML += `
            <div class="card-item glass-panel">
                <span>${names[pair.uDenPlayer]} → ${names[pair.uDenVictim]}</span>
                <button class="btn btn-danger btn-small remove-uden" data-idx="${idx}">Xóa</button>
            </div>
        `;
    });
    document.getElementById('btn-clear-uden').style.display = uDenPairs.length > 0 ? 'inline-block' : 'none';
}

function resetRoundInputs() {
    isUMode = false;
    isUDenMode = false;
    chopPairs = [];
    uDenPairs = [];
    uPlayerIndex = '';
    
    document.querySelectorAll('.rank-select').forEach(sel => sel.value = '');
    document.getElementById('u-player-select').value = '';
    
    updateUIState();
    renderChopPairs();
}

function validateRanks(ranks) {
    const nonMom = ranks.filter(r => r !== '5' && r !== '');
    const requiredRanks = [1, 2, 3, 4].slice(0, nonMom.length).map(String);
    const hasAllReq = requiredRanks.every(r => nonMom.includes(r));
    const isUnique = new Set(nonMom).size === nonMom.length;
    return hasAllReq && isUnique;
}

async function calculateScores() {
    const names = AppState.settings.playerNames;
    const scores = AppState.settings.scores;
    const numPlayers = names.length;
    
    let ranks = [];
    if (!isUMode && !isUDenMode) {
        document.querySelectorAll('.rank-select').forEach(sel => ranks.push(sel.value));
        if (ranks.some(r => !r)) return showToast('Vui lòng chọn xếp hạng cho tất cả', 'error');
        if (ranks.filter(r => r !== '5').length > 0 && !validateRanks(ranks)) {
            return showToast('Xếp hạng không hợp lệ hoặc trùng lặp', 'error');
        }
    } else if (isUMode) {
        if (!uPlayerIndex) return showToast('Vui lòng chọn người Ù', 'error');
    } else if (isUDenMode) {
        if (uDenPairs.length === 0) return showToast('Vui lòng chọn ít nhất một cặp Ù Đền', 'error');
    }

    let rankScores = Array(numPlayers).fill(0);
    let uScores = Array(numPlayers).fill(0);
    let uDenScores = Array(numPlayers).fill(0);

    // Calculate U
    if (isUMode) {
        const uInd = parseInt(uPlayerIndex);
        for(let i=0; i<numPlayers; i++) {
            if (i !== uInd) uScores[i] = scores.uPenalty;
        }
        uScores[uInd] = -scores.uPenalty * (numPlayers - 1);
    } 
    // Calculate U Den
    else if (isUDenMode) {
        uDenPairs.forEach(({uDenPlayer, uDenVictim}) => {
            uDenScores[uDenVictim] = scores.uDenPenalty;
            uDenScores[uDenPlayer] = -scores.uDenPenalty;
        });
    } 
    // Calculate Rank
    else {
        const nonMomPlayers = ranks.filter(r => r !== '5');
        const momBonus = ranks.filter(r => r === '5').length * -scores.mom;
        
        let nonMomDeduction = 0;
        nonMomPlayers.forEach(r => {
            if (r === '4') nonMomDeduction += -scores.rank4;
            if (r === '3') nonMomDeduction += -scores.rank3;
            if (r === '2') nonMomDeduction += -scores.rank2;
        });

        ranks.forEach((r, i) => {
            if (r === '5') rankScores[i] = scores.mom;
            else if (r === '4') rankScores[i] = scores.rank4;
            else if (r === '3') rankScores[i] = scores.rank3;
            else if (r === '2') rankScores[i] = scores.rank2;
            else if (r === '1') rankScores[i] = nonMomDeduction + momBonus;
        });
    }

    // Calculate Chop
    let chopScoresArr = Array(numPlayers).fill(0);
    chopPairs.forEach(({eater, eaten}) => {
        chopScoresArr[eater] += scores.chop;
        chopScoresArr[eaten] -= scores.chop;
    });

    // Total
    const totalScores = rankScores.map((val, i) => val + uScores[i] + uDenScores[i] + chopScoresArr[i]);

    // Save
    AppState.history.push({
        rankScores, chopScores: chopScoresArr, uScores, uDenScores, totalScores,
        chopPairs: [...chopPairs], uDenPairs: [...uDenPairs], 
        uPlayerIndex: isUMode ? parseInt(uPlayerIndex) : undefined
    });
    
    showToast('Dang luu Cloud...', 'info');
    await saveHistory();
    resetRoundInputs();
    renderHistory();
    showToast('Da tinh diem vong dau', 'success');
}

function renderHistory() {
    const names = AppState.settings.playerNames;
    const history = AppState.history;
    
    // Header
    const thead = document.getElementById('history-header');
    thead.innerHTML = `<th>Vòng</th>` + names.map(n => `<th>${n}</th>`).join('');
    
    // Body
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    
    let runningTotals = Array(names.length).fill(0);
    let cumulativeHistory = [];
    
    history.forEach((round, index) => {
        let cols = `<td>${index + 1}</td>`;
        round.totalScores.forEach((score, i) => {
            runningTotals[i] += score;
            cols += `<td class="${score > 0 ? 'text-green' : score < 0 ? 'text-red' : ''}">${score > 0 ? '+'+score : score}</td>`;
        });
        cumulativeHistory.push([...runningTotals]);
        
        tbody.innerHTML += `<tr>${cols}</tr>`;
    });
    
    if (history.length > 0) {
        let totalCols = `<td class="total-row">Tổng</td>`;
        runningTotals.forEach(total => {
            totalCols += `<td class="total-row ${total > 0 ? 'text-green' : total < 0 ? 'text-red' : ''}">${total}</td>`;
        });
        tbody.innerHTML += `<tr>${totalCols}</tr>`;
    }

    drawChart(cumulativeHistory);
}

function drawChart(runningTotalsHistory) {
    const names = AppState.settings.playerNames;
    const ctx = document.getElementById('score-chart');
    const container = document.getElementById('chart-container');

    if (!document.getElementById('score-chart')) return;

    if (runningTotalsHistory.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';

    const labels = runningTotalsHistory.map((_, i) => `Vòng ${i + 1}`);
    const datasets = names.map((name, playerIdx) => {
        const data = runningTotalsHistory.map(totalsObj => totalsObj[playerIdx]);
        return {
            label: name,
            data: data,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3
        };
    });
    
    const colors = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5AC8FA'];
    datasets.forEach((ds, i) => {
        ds.borderColor = colors[i % colors.length];
        ds.backgroundColor = `${colors[i % colors.length]}33`;
    });

    if (scoreChart) {
        scoreChart.data.labels = labels;
        scoreChart.data.datasets = datasets;
        scoreChart.update();
    } else {
        scoreChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                color: '#fff',
                scales: {
                    x: { ticks: { color: '#EBEBF599' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: '#EBEBF599' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });
    }
}
