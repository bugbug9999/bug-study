/**
 * Urgent Tasks Panel Component
 */

function createUrgentTasks(options = {}) {
    const { tasks = [], onTaskClick, onPing } = options;

    const container = document.createElement('section');
    container.className = 'urgent-tasks card';

    const header = document.createElement('div');
    header.className = 'card__header';
    header.innerHTML = `
    <h2 class="card__title">
      <span class="card__title-icon">🔥</span>
      임박 태스크
      <span style="color: var(--accent-red); font-size: 14px;">(${tasks.length})</span>
    </h2>
  `;
    container.appendChild(header);

    if (tasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
      <div class="empty-state__icon">🎉</div>
      <div class="empty-state__title">임박한 태스크가 없습니다</div>
      <div class="empty-state__description">모든 태스크가 여유있게 진행 중입니다</div>
    `;
        container.appendChild(empty);
        return container;
    }

    const list = document.createElement('div');
    list.className = 'urgent-tasks__list';

    tasks.forEach((task, index) => {
        const epic = MockData.getEpicById(task.epicId);
        const dday = DateUtils.calculateDday(task.endDate);

        const item = document.createElement('div');
        item.className = 'urgent-task-item animate-slideUp';
        item.style.animationDelay = `${index * 50}ms`;

        item.innerHTML = `
      <span class="urgent-task-item__fire">🔥</span>
      <div class="urgent-task-item__content">
        <div class="urgent-task-item__epic">${epic?.title || '에픽 없음'}</div>
        <div class="urgent-task-item__name">${task.title}</div>
      </div>
      <div class="urgent-task-item__meta">
        <span class="urgent-task-item__dday">${DateUtils.formatDday(dday)}</span>
        <div class="urgent-task-item__assignee">
          <div class="avatar avatar--sm">${getInitials(task.assignee?.name)}</div>
          <span style="font-size: 12px; color: var(--text-secondary);">${task.assignee?.name || ''}</span>
        </div>
        <div class="urgent-task-item__ping"></div>
      </div>
    `;

        // Add ping button
        const pingContainer = item.querySelector('.urgent-task-item__ping');
        const pingBtn = createPingButton(task, () => onPing?.(task, epic));
        pingContainer.appendChild(pingBtn);

        // Click to open detail
        item.addEventListener('click', () => onTaskClick?.(task));

        list.appendChild(item);
    });

    container.appendChild(list);
    return container;
}

function getInitials(name) {
    if (!name) return '?';
    return name.charAt(0);
}
