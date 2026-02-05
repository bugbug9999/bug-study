/**
 * Timeline (Gantt Chart) Component
 * 선택된 월에 맞는 타임라인 표시
 */

function createTimeline(options = {}) {
  const { epics = [], onEpicClick, onTaskClick, selectedMonth } = options;

  const container = document.createElement('section');
  container.className = 'card';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <h2 class="card__title">
      <span class="card__title-icon">📊</span>
      에픽 타임라인
    </h2>
  `;
  container.appendChild(header);

  if (epics.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-lg);';
    const monthNum = selectedMonth ? selectedMonth.getMonth() + 1 : new Date().getMonth() + 1;
    empty.textContent = `${monthNum}월에 해당하는 에픽이 없습니다.`;
    container.appendChild(empty);
    return container;
  }

  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  // 선택된 월의 시작과 끝 계산
  const { start: timelineStart, end: timelineEnd } = getMonthRange(selectedMonth || new Date());

  // 해당 월의 일자들
  const days = getDaysInMonth(selectedMonth || new Date());

  // Timeline header (일자) - 2개월 표시
  const timelineHeader = document.createElement('div');
  timelineHeader.className = 'timeline__header';

  // 일자 표시: 1일에만 월 표시, 나머지는 숫자만
  const dayElements = days.map((d, i) => {
    const showMonth = d.day === 1;
    const className = d.isCurrentMonth ? 'timeline__day timeline__day--current' : 'timeline__day';
    const label = showMonth ? `${d.month}/${d.day}` : d.day;
    return `<div class="${className}">${label}</div>`;
  }).join('');

  timelineHeader.innerHTML = `
    <div class="timeline__labels">
      <span style="font-size: 12px; color: var(--text-secondary);">에픽</span>
    </div>
    <div class="timeline__months">
      ${dayElements}
    </div>
  `;
  timeline.appendChild(timelineHeader);

  // Timeline body
  const timelineBody = document.createElement('div');
  timelineBody.className = 'timeline__body';

  // Render epics
  epics.forEach(epic => {
    const epicRow = createEpicRow(epic, timelineStart, timelineEnd, onEpicClick, false);
    timelineBody.appendChild(epicRow);
  });

  timeline.appendChild(timelineBody);
  container.appendChild(timeline);

  return container;
}

/**
 * Task Timeline Component
 */
function createTaskTimeline(options = {}) {
  const { tasks = [], onTaskClick, selectedMonth } = options;

  const container = document.createElement('section');
  container.className = 'card';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <h2 class="card__title">
      <span class="card__title-icon">📋</span>
      태스크 타임라인
    </h2>
  `;
  container.appendChild(header);

  if (tasks.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-lg);';
    if (selectedMonth) {
      const month = selectedMonth.getMonth() + 1;
      const prevMonth = month === 1 ? 12 : month - 1;
      empty.textContent = `${prevMonth}월~${month}월에 해당하는 태스크가 없습니다.`;
    } else {
      empty.textContent = '해당하는 태스크가 없습니다.';
    }
    container.appendChild(empty);
    return container;
  }

  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  // 선택된 월의 시작과 끝 계산
  const { start: timelineStart, end: timelineEnd } = getMonthRange(selectedMonth || new Date());
  const days = getDaysInMonth(selectedMonth || new Date());

  // Timeline header - 2개월 표시
  const timelineHeader = document.createElement('div');
  timelineHeader.className = 'timeline__header';

  const dayElements = days.map((d, i) => {
    const showMonth = d.day === 1;
    const className = d.isCurrentMonth ? 'timeline__day timeline__day--current' : 'timeline__day';
    const label = showMonth ? `${d.month}/${d.day}` : d.day;
    return `<div class="${className}">${label}</div>`;
  }).join('');

  timelineHeader.innerHTML = `
    <div class="timeline__labels">
      <span style="font-size: 12px; color: var(--text-secondary);">태스크</span>
    </div>
    <div class="timeline__months">
      ${dayElements}
    </div>
  `;
  timeline.appendChild(timelineHeader);

  // Timeline body
  const timelineBody = document.createElement('div');
  timelineBody.className = 'timeline__body';

  // Render tasks
  tasks.forEach(task => {
    const taskRow = createStandaloneTaskRow(task, timelineStart, timelineEnd, onTaskClick);
    timelineBody.appendChild(taskRow);
  });

  timeline.appendChild(timelineBody);
  container.appendChild(timeline);

  return container;
}

// 2개월 범위 (직전월 ~ 해당월) 반환
function getMonthRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  // 직전월 1일부터 해당월 말일까지
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

// 2개월 일자 배열 반환 (직전월 + 해당월)
function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // 직전월
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

  // 해당월
  const currLastDay = new Date(year, month + 1, 0).getDate();

  const days = [];

  // 직전월 일자 (월 표시 포함)
  for (let d = 1; d <= prevLastDay; d++) {
    days.push({ day: d, month: prevMonth + 1, isCurrentMonth: false });
  }

  // 해당월 일자
  for (let d = 1; d <= currLastDay; d++) {
    days.push({ day: d, month: month + 1, isCurrentMonth: true });
  }

  return days;
}

function createEpicRow(epic, timelineStart, timelineEnd, onEpicClick, showTasks = true) {
  const tasks = MockData.getTasksByEpic(epic.id);
  const row = document.createElement('div');
  row.className = 'epic-row';

  // Epic header
  const header = document.createElement('div');
  header.className = 'epic-row__header';

  const left = DateUtils.calculateTimelinePosition(epic.startDate, timelineStart, timelineEnd);
  const width = DateUtils.calculateTimelineWidth(epic.startDate, epic.endDate, timelineStart, timelineEnd);

  const dday = DateUtils.calculateDday(epic.endDate);
  const isUrgent = dday <= 2 && dday >= 0 && epic.status !== 'Done';
  const statusClass = getStatusClass(epic.status, isUrgent);

  // Format dates for tooltip
  const startDateStr = DateUtils.formatDateKorean(epic.startDate);
  const endDateStr = DateUtils.formatDateKorean(epic.endDate);
  const tooltipText = `${epic.title}\n${startDateStr} ~ ${endDateStr}\n상태: ${epic.status}`;

  header.innerHTML = `
    <div class="epic-row__label">
      ${showTasks ? `<span class="epic-row__toggle" id="toggle-${epic.id}">▶</span>` : ''}
      <span class="epic-row__name">${epic.title}</span>
    </div>
    <div class="epic-row__bar-container">
      <div class="gantt-bar gantt-bar--${statusClass}" 
           style="left: ${Math.max(0, left)}%; width: ${Math.min(100, width)}%;"
           title="${tooltipText}">
        ${epic.title}
        <div class="gantt-bar__avatar">
          ${getAvatarHtml(epic.assignee, 'sm')}
        </div>
      </div>
    </div>
  `;

  row.appendChild(header);

  if (showTasks && tasks.length > 0) {
    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-rows';
    taskContainer.id = `tasks-${epic.id}`;

    tasks.forEach(task => {
      const taskRow = createTaskRow(task, timelineStart, timelineEnd, null);
      taskContainer.appendChild(taskRow);
    });

    row.appendChild(taskContainer);

    const toggle = header.querySelector(`#toggle-${epic.id}`);
    let isExpanded = true;

    header.addEventListener('click', () => {
      isExpanded = !isExpanded;
      toggle.classList.toggle('is-expanded', isExpanded);
      taskContainer.classList.toggle('is-collapsed', !isExpanded);
      taskContainer.style.maxHeight = isExpanded ? `${tasks.length * 40}px` : '0';
    });

    toggle.classList.add('is-expanded');
    taskContainer.style.maxHeight = `${tasks.length * 40}px`;
  }

  // Epic bar click
  const epicBar = header.querySelector('.gantt-bar');
  if (epicBar) {
    epicBar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onEpicClick) onEpicClick(epic);
    });
  }

  return row;
}

function getStatusClass(status, isUrgent) {
  if (isUrgent) return 'urgent';
  const normalized = (status || 'todo').toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('progress') || normalized.includes('진행')) return 'inprogress';
  if (normalized.includes('review') || normalized.includes('리뷰')) return 'review';
  if (normalized.includes('done') || normalized.includes('완료')) return 'done';
  return 'todo';
}

function createTaskRow(task, timelineStart, timelineEnd, onTaskClick) {
  const row = document.createElement('div');
  row.className = 'task-row';

  const left = DateUtils.calculateTimelinePosition(task.startDate, timelineStart, timelineEnd);
  const width = DateUtils.calculateTimelineWidth(task.startDate, task.endDate, timelineStart, timelineEnd);

  const dday = DateUtils.calculateDday(task.endDate);
  const isUrgent = dday <= 2 && dday >= 0 && task.status !== 'Done';
  const statusClass = getStatusClass(task.status, isUrgent);

  const startDateStr = DateUtils.formatDateKorean(task.startDate);
  const endDateStr = DateUtils.formatDateKorean(task.endDate);
  const tooltipText = `${task.title}\n${startDateStr} ~ ${endDateStr}\n상태: ${task.status}`;

  row.innerHTML = `
    <div class="task-row__label">
      <span class="task-row__connector"></span>
      <span class="task-row__name">${task.title}</span>
    </div>
    <div class="task-row__bar-container">
      <div class="gantt-bar gantt-bar--${statusClass}" 
           style="left: ${Math.max(0, left)}%; width: ${Math.min(100, width)}%; height: 18px; top: 3px;"
           title="${tooltipText}">
        ${task.title}
      </div>
    </div>
  `;

  const taskBar = row.querySelector('.gantt-bar');
  if (taskBar) {
    taskBar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onTaskClick) onTaskClick(task);
    });
  }

  return row;
}

function createStandaloneTaskRow(task, timelineStart, timelineEnd, onTaskClick) {
  const epic = MockData.getEpicById(task.epicId);
  const row = document.createElement('div');
  row.className = 'epic-row';

  const header = document.createElement('div');
  header.className = 'epic-row__header';

  const left = DateUtils.calculateTimelinePosition(task.startDate, timelineStart, timelineEnd);
  const width = DateUtils.calculateTimelineWidth(task.startDate, task.endDate, timelineStart, timelineEnd);

  const dday = DateUtils.calculateDday(task.endDate);
  const isUrgent = dday <= 2 && dday >= 0 && task.status !== 'Done';
  const statusClass = getStatusClass(task.status, isUrgent);

  const startDateStr = DateUtils.formatDateKorean(task.startDate);
  const endDateStr = DateUtils.formatDateKorean(task.endDate);
  const tooltipText = `${task.title}\n${startDateStr} ~ ${endDateStr}\n상태: ${task.status}\n에픽: ${epic?.title || '-'}`;

  header.innerHTML = `
    <div class="epic-row__label">
      <span class="epic-row__name" style="font-size: 13px;">${task.title}</span>
    </div>
    <div class="epic-row__bar-container">
      <div class="gantt-bar gantt-bar--${statusClass}" 
           style="left: ${Math.max(0, left)}%; width: ${Math.min(100, width)}%;"
           title="${tooltipText}">
        ${task.title}
        <div class="gantt-bar__avatar">
          ${getAvatarHtml(task.assignee, 'sm')}
        </div>
      </div>
    </div>
  `;

  row.appendChild(header);

  const taskBar = header.querySelector('.gantt-bar');
  if (taskBar) {
    taskBar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onTaskClick) onTaskClick(task);
    });
  }

  return row;
}
