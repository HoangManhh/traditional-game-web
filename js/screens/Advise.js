import { navigateTo } from '../main.js';

export function initAdviseScreen() {
  const container = document.getElementById('screen-advise');
  
  const adviceLines1 = Array.from({ length: 5 }, (_, index) => `Lời khuyên ${index + 1}: Cờ bạc, người không chơi là người thắng!!!`);
  const adviceLines2 = Array.from({ length: 5 }, (_, index) => `Lời khuyên ${index + 6}: 99% con bạc dừng lại trước khi thắng lớn!!!`);
  
  const advices = [...adviceLines1, ...adviceLines2];
  
  let listHtml = '';
  advices.forEach(adv => {
      listHtml += `<div class="card-item glass-panel" style="margin-bottom:10px;">${adv}</div>`;
  });

  container.innerHTML = `
    <div class="header">
        <button class="back-btn" id="advise-back-btn">Trở về</button>
        <div class="header-title">Thủ thuật chơi</div>
    </div>
    
    <div class="card-list" style="padding-bottom: 20px;">
        <h3 class="section-title">10 Thủ thuật chơi</h3>
        ${listHtml}
    </div>
  `;

  document.getElementById('advise-back-btn').addEventListener('click', () => {
    navigateTo('home');
  });
}
