/**
 * Epic Detail Page
 */

function renderEpicDetail(params) {
    const id = params.id;
    const app = document.getElementById('app');
    app.innerHTML = '';

    const epic = MockData.getEpicById(id);

    if (!epic) {
        app.innerHTML = `
      <div class="empty-state" style="min-height: 100vh; justify-content: center;">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">에픽을 찾을 수 없습니다</div>
        <div class="empty-state__description">
          <a href="#/" style="color: var(--accent-blue);">대시보드로 돌아가기</a>
        </div>
      </div>
    `;
        return;
    }

    // Header
    const header = createHeader({
        onRefresh: () => renderEpicDetail(params)
    });
    app.appendChild(header);

    // Main content
    const main = document.createElement('main');
    main.className = 'main-content';

    const tasks = MockData.getTasksByEpic(id);
    const dday = DateUtils.calculateDday(epic.endDate);
    const isUrgent = dday <= 2 && dday >= 0 && epic.status !== 'Done';

    main.innerHTML = `
    <!-- Back Button -->
    <div style="margin-bottom: var(--space-md);">
      <a href="#/" class="link-btn" style="display: inline-flex;">
        <span>←</span>
        <span>대시보드</span>
      </a>
    </div>
    
    <!-- Epic Header Card -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
        <div>
          <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">에픽</div>
          <h1 style="font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-sm);">
            ${epic.title}
            ${isUrgent ? '<span style="margin-left: 8px;">🔥</span>' : ''}
          </h1>
          <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
            <span class="status-badge status-badge--${epic.status.toLowerCase().replace(' ', '')}">
              ${epic.status}
            </span>
            <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${DateUtils.formatDateKorean(epic.startDate)} ~ ${DateUtils.formatDateKorean(epic.endDate)}
            </span>
            <span style="font-weight: 600; color: ${isUrgent ? 'var(--accent-red)' : 'var(--text-secondary)'}; font-size: var(--font-size-sm);">
              ${DateUtils.formatDday(dday)}
            </span>
          </div>
        </div>
        <div style="display: flex; gap: var(--space-sm);">
          ${epic.notionUrl ? `
            <a href="${epic.notionUrl}" target="_blank" class="link-btn">
              <span>📝</span>
              <span>노션</span>
            </a>
          ` : ''}
          ${epic.confluenceUrl ? `
            <a href="${epic.confluenceUrl}" target="_blank" class="link-btn">
              <span>📎</span>
              <span>컨플루언스</span>
            </a>
          ` : ''}
        </div>
      </div>
      
      <!-- Epic Info -->
      <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--bg-tertiary); display: flex; gap: var(--space-xl); flex-wrap: wrap;">
        <div>
          <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">담당자</div>
          <div class="person-info">
            <div class="avatar avatar--sm">${getInitials(epic.assignee?.name)}</div>
            <span class="person-info__name">${epic.assignee?.name || '-'}</span>
          </div>
        </div>
        <div>
          <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">리뷰어</div>
          <div class="person-info">
            <div class="avatar avatar--sm">${getInitials(epic.reviewer?.name)}</div>
            <span class="person-info__name">${epic.reviewer?.name || '-'}</span>
          </div>
        </div>
      </div>
      
      ${epic.confluenceSummary ? `
        <div style="margin-top: var(--space-md); padding: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: var(--font-size-sm); color: var(--text-secondary);">
          ${epic.confluenceSummary}
        </div>
      ` : ''}
    </div>
    
    <!-- Tasks List -->
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">
          <span class="card__title-icon">📋</span>
          태스크 목록
          <span style="color: var(--text-secondary); font-size: 14px;">(${tasks.length})</span>
        </h2>
      </div>
      
      <div id="tasks-list"></div>
    </div>
  `;

    app.appendChild(main);

    // Render tasks list
    const tasksList = main.querySelector('#tasks-list');

    if (tasks.length === 0) {
        tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📝</div>
        <div class="empty-state__title">태스크가 없습니다</div>
        <div class="empty-state__description">이 에픽에 연결된 태스크가 없습니다</div>
      </div>
    `;
    } else {
        tasks.forEach(task => {
            const taskDday = DateUtils.calculateDday(task.endDate);
            const taskUrgent = taskDday <= 2 && taskDday >= 0 && task.status !== 'Done';

            const taskItem = document.createElement('div');
            taskItem.className = 'info-row';
            taskItem.style.cssText = 'cursor: pointer; padding: var(--space-md); margin: var(--space-xs) 0; border-radius: var(--radius-sm); transition: background var(--transition-fast);';

            taskItem.innerHTML = `
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: 4px;">
            ${taskUrgent ? '<span>🔥</span>' : ''}
            <span style="font-weight: 500;">${task.title}</span>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">
            ${DateUtils.formatDateKorean(task.startDate)} ~ ${DateUtils.formatDateKorean(task.endDate)}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <span class="status-badge status-badge--${task.status.toLowerCase().replace(' ', '')}" style="font-size: 11px;">
            ${task.status}
          </span>
          <div class="avatar avatar--sm">${getInitials(task.assignee?.name)}</div>
        </div>
      `;

            taskItem.addEventListener('mouseenter', () => {
                taskItem.style.background = 'var(--bg-tertiary)';
            });
            taskItem.addEventListener('mouseleave', () => {
                taskItem.style.background = '';
            });

            taskItem.addEventListener('click', () => {
                createTaskDetail({
                    task,
                    onPing: async (task, epic) => {
                        console.log('Ping sent for:', task.title);
                        return new Promise(resolve => setTimeout(resolve, 1000));
                    }
                });
            });

            tasksList.appendChild(taskItem);
        });
    }

    // Tab navigation (mobile)
    const tabNav = createTabNav();
    app.appendChild(tabNav);
}
