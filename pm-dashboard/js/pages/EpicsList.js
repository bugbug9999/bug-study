/**
 * Epics List Page
 */

function renderEpicsList() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Header
    const header = createHeader({
        onRefresh: () => renderEpicsList()
    });
    app.appendChild(header);

    // Main content
    const main = document.createElement('main');
    main.className = 'main-content';

    main.innerHTML = `
    <h1 style="font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-lg);">
      📋 에픽 목록
    </h1>
    <div id="epics-grid" style="display: grid; gap: var(--space-md);"></div>
  `;

    app.appendChild(main);

    const epicsGrid = main.querySelector('#epics-grid');

    MockData.epics.forEach((epic, index) => {
        const tasks = MockData.getTasksByEpic(epic.id);
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const dday = DateUtils.calculateDday(epic.endDate);
        const isUrgent = dday <= 2 && dday >= 0 && epic.status !== 'Done';

        const card = document.createElement('div');
        card.className = 'card animate-slideUp';
        card.style.cssText = `cursor: pointer; transition: all var(--transition-fast); animation-delay: ${index * 50}ms;`;

        card.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-md);">
        <div>
          <h2 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: 4px;">
            ${epic.title}
            ${isUrgent ? '<span style="margin-left: 4px;">🔥</span>' : ''}
          </h2>
          <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
            ${DateUtils.formatDateKorean(epic.startDate)} ~ ${DateUtils.formatDateKorean(epic.endDate)}
          </div>
        </div>
        <span class="status-badge status-badge--${epic.status.toLowerCase().replace(' ', '')}">
          ${epic.status}
        </span>
      </div>
      
      <!-- Progress Bar -->
      <div style="margin-bottom: var(--space-md);">
        <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">
          <span>진행률</span>
          <span>${completedTasks}/${tasks.length} 완료</span>
        </div>
        <div style="height: 6px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-green)); border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div class="person-info">
          <div class="avatar avatar--sm">${getInitials(epic.assignee?.name)}</div>
          <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${epic.assignee?.name || '-'}</span>
        </div>
        <span style="font-size: var(--font-size-sm); font-weight: 600; color: ${isUrgent ? 'var(--accent-red)' : 'var(--text-secondary)'};">
          ${DateUtils.formatDday(dday)}
        </span>
      </div>
    `;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = 'var(--shadow-md)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        card.addEventListener('click', () => {
            navigateTo(`/epic/${epic.id}`);
        });

        epicsGrid.appendChild(card);
    });

    // Tab navigation (mobile)
    const tabNav = createTabNav();
    app.appendChild(tabNav);
}
