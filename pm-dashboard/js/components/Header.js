/**
 * Header Component
 */

function createHeader(options = {}) {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
    <div class="header__logo">
      <span class="header__logo-icon">🎯</span>
      <span class="header__logo-text">Lair Team PM Dashboard - Gugu(bot)</span>
    </div>
    <div class="header__actions">
      <button class="btn-refresh" id="refresh-btn" title="새로고침">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      </button>
    </div>
  `;

  const refreshBtn = header.querySelector('#refresh-btn');
  refreshBtn.addEventListener('click', () => {
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      refreshBtn.style.transform = '';
    }, 500);
    if (options.onRefresh) options.onRefresh();
  });

  return header;
}
