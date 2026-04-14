import { navigateTo } from '../main.js';

export function initHomeScreen() {
  const container = document.getElementById('screen-home');
  container.innerHTML = `
    <div class="glass-panel" style="padding: 30px; text-align: center; margin: auto 0;">
        <img src="assets/images/huan-rose.png" alt="Huan Rose" class="home-image" id="home-yt-link">
        
        <div class="title-container" style="margin-bottom: 30px;">
            <h1 class="title">Trò Chơi Dân Gian</h1>
            <p class="subtitle">//Lưu hành nội bộ</p>
        </div>

        <button class="btn btn-primary" id="btn-start">Bắt Đầu</button>
        <button class="btn btn-success" id="btn-settings">Cài Đặt</button>
        <button class="btn btn-secondary" id="btn-advise">100 lời khuyên</button>
    </div>
  `;

  document.getElementById('home-yt-link').addEventListener('click', () => {
    window.open('https://www.youtube.com/watch?v=utTw_g4jkDw', '_blank');
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    navigateTo('game');
  });
  
  document.getElementById('btn-settings').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.getElementById('btn-advise').addEventListener('click', () => {
    navigateTo('advise');
  });
}
