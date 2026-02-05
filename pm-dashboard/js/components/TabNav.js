/**
 * Tab Navigation Component (Mobile)
 */

function createTabNav() {
    const nav = document.createElement('nav');
    nav.className = 'tab-nav';

    const tabs = [
        { path: '/', icon: '🏠', label: '홈' },
        { path: '/epics', icon: '📋', label: '에픽' },
        { path: '/settings', icon: '⚙️', label: '설정' },
    ];

    nav.innerHTML = `
    <ul class="tab-nav__list">
      ${tabs.map(tab => `
        <li class="tab-nav__item">
          <a href="#${tab.path}" class="tab-nav__link" data-path="${tab.path}">
            <span class="tab-nav__icon">${tab.icon}</span>
            <span>${tab.label}</span>
          </a>
        </li>
      `).join('')}
    </ul>
  `;

    // Update active state on route change
    function updateActiveTab() {
        const currentPath = window.location.hash.slice(1) || '/';
        nav.querySelectorAll('.tab-nav__link').forEach(link => {
            const path = link.dataset.path;
            link.classList.toggle('is-active', path === currentPath ||
                (currentPath.startsWith('/epic/') && path === '/epics'));
        });
    }

    window.addEventListener('hashchange', updateActiveTab);
    updateActiveTab();

    return nav;
}
