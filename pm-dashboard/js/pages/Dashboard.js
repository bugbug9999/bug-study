/**
 * Dashboard Page with Month-based filter and pagination
 */

let currentEpicPage = 1;
let currentTaskPage = 1;
let currentUrgentPage = 1;
let currentMonth = new Date(); // 현재 선택된 월
const ITEMS_PER_PAGE = 20;
const URGENT_PER_PAGE = 5;

function renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Reset pagination
    currentEpicPage = 1;
    currentTaskPage = 1;
    currentMonth = new Date();

    // Header
    const header = createHeader({
        onRefresh: async () => {
            await MockData.refresh();
            renderDashboard();
        }
    });
    app.appendChild(header);

    // Main content
    const main = document.createElement('main');
    main.className = 'main-content';
    app.appendChild(main);

    // Render dashboard content
    renderDashboardContent(main);

    // Tab navigation (mobile)
    const tabNav = createTabNav();
    app.appendChild(tabNav);
}

function renderDashboardContent(container) {
    container.innerHTML = '';

    const urgentTasks = MockData.getUrgentTasks();

    // Handle ping
    const handlePing = async (task, epic) => {
        console.log('Ping sent for:', task.title);
        if (!task.pingHistory) task.pingHistory = [];
        task.pingHistory.push({
            time: new Date().toISOString(),
            target: task.status === 'Review' ? task.reviewer : task.assignee
        });
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    // Handle task click
    const handleTaskClick = (task) => {
        createTaskDetail({
            task,
            onPing: handlePing
        });
    };

    // Handle epic click
    const handleEpicClick = (epic) => {
        navigateTo(`/epic/${epic.id}`);
    };

    // 상단 2열 레이아웃 (임박태스크 + 회의록)
    const topRow = document.createElement('div');
    topRow.className = 'dashboard-top-row';
    topRow.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-lg);
        margin-bottom: var(--space-lg);
    `;

    // 임박 태스크 섹션 (페이지네이션)
    const urgentSection = document.createElement('div');
    urgentSection.id = 'urgent-section';
    renderUrgentSection(urgentSection, urgentTasks, handleTaskClick, handlePing);
    topRow.appendChild(urgentSection);

    // 회의록 섹션
    const meetingSection = document.createElement('div');
    renderMeetingSection(meetingSection);
    topRow.appendChild(meetingSection);

    container.appendChild(topRow);

    // Month Picker
    const monthPicker = createMonthPicker(() => {
        currentEpicPage = 1;
        currentTaskPage = 1;
        renderEpicTimeline(document.getElementById('epic-section'), handleEpicClick, handleTaskClick);
        renderTaskTimeline(document.getElementById('task-section'), handleTaskClick);
    });
    container.appendChild(monthPicker);

    // Epic Timeline with pagination
    const epicSection = document.createElement('div');
    epicSection.id = 'epic-section';
    renderEpicTimeline(epicSection, handleEpicClick, handleTaskClick);
    container.appendChild(epicSection);

    // Task Timeline with pagination
    const taskSection = document.createElement('div');
    taskSection.id = 'task-section';
    renderTaskTimeline(taskSection, handleTaskClick);
    container.appendChild(taskSection);
}

function createMonthPicker(onChange) {
    const container = document.createElement('div');
    container.className = 'month-picker';
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-lg);
    `;

    const updateDisplay = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        container.innerHTML = `
            <button class="month-picker__btn" data-action="prev">◀ 이전</button>
            <span class="month-picker__label" style="font-size: 16px; font-weight: 600; min-width: 180px; text-align: center;">
                ${prevYear}년 ${prevMonth}월 ~ ${year}년 ${month}월
            </span>
            <button class="month-picker__btn" data-action="next">다음 ▶</button>
        `;

        container.querySelector('[data-action="prev"]').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            updateDisplay();
            onChange();
        });

        container.querySelector('[data-action="next"]').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            updateDisplay();
            onChange();
        });
    };

    updateDisplay();
    return container;
}

function getItemsForMonth(items, month) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // 해당월 + 직전월 = 2개월 범위
    const monthStart = new Date(year, monthIndex - 1, 1);  // 직전월 1일
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);  // 해당월 말일

    return items.filter(item => {
        // 1순위: 시작일/마감일로 필터링
        if (item.startDate || item.endDate) {
            const itemStart = item.startDate ? new Date(item.startDate) : null;
            const itemEnd = item.endDate ? new Date(item.endDate) : itemStart;

            if (itemStart || itemEnd) {
                const effectiveStart = itemStart || itemEnd;
                const effectiveEnd = itemEnd || itemStart;
                return effectiveEnd >= monthStart && effectiveStart <= monthEnd;
            }
        }

        // 2순위: lastEditedTime으로 필터링 (날짜가 없는 경우)
        if (item.lastEditedTime) {
            const editedDate = new Date(item.lastEditedTime);
            return editedDate >= monthStart && editedDate <= monthEnd;
        }

        // 3순위: createdTime으로 필터링
        if (item.createdTime) {
            const createdDate = new Date(item.createdTime);
            return createdDate >= monthStart && createdDate <= monthEnd;
        }

        return false;
    }).sort((a, b) => {
        // 최신 수정순
        return new Date(b.lastEditedTime || b.endDate || b.createdTime) -
            new Date(a.lastEditedTime || a.endDate || a.createdTime);
    });
}

function renderEpicTimeline(container, onEpicClick, onTaskClick) {
    const monthEpics = getItemsForMonth(MockData.epics, currentMonth);
    const start = (currentEpicPage - 1) * ITEMS_PER_PAGE;
    const pageEpics = monthEpics.slice(start, start + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(monthEpics.length / ITEMS_PER_PAGE);

    container.innerHTML = '';

    // Create timeline
    const timeline = createTimeline({
        epics: pageEpics,
        onEpicClick,
        onTaskClick,
        selectedMonth: currentMonth
    });
    timeline.style.marginBottom = 'var(--space-md)';
    container.appendChild(timeline);

    // Pagination or empty message
    if (monthEpics.length > ITEMS_PER_PAGE) {
        const pagination = createPagination({
            current: currentEpicPage,
            total: totalPages,
            totalItems: monthEpics.length,
            label: '에픽',
            onPageChange: (newPage) => {
                currentEpicPage = newPage;
                renderEpicTimeline(container, onEpicClick, onTaskClick);
            }
        });
        container.appendChild(pagination);
    } else if (monthEpics.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-md);';
        emptyMsg.textContent = `${currentMonth.getMonth() + 1}월에 해당하는 에픽이 없습니다.`;
        container.appendChild(emptyMsg);
    }
}

function renderTaskTimeline(container, onTaskClick) {
    const monthTasks = getItemsForMonth(MockData.tasks, currentMonth);
    const start = (currentTaskPage - 1) * ITEMS_PER_PAGE;
    const pageTasks = monthTasks.slice(start, start + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(monthTasks.length / ITEMS_PER_PAGE);

    container.innerHTML = '';

    // Create timeline
    const timeline = createTaskTimeline({
        tasks: pageTasks,
        onTaskClick,
        selectedMonth: currentMonth
    });
    container.appendChild(timeline);

    // Pagination or empty message
    if (monthTasks.length > ITEMS_PER_PAGE) {
        const pagination = createPagination({
            current: currentTaskPage,
            total: totalPages,
            totalItems: monthTasks.length,
            label: '태스크',
            onPageChange: (newPage) => {
                currentTaskPage = newPage;
                renderTaskTimeline(container, onTaskClick);
            }
        });
        container.appendChild(pagination);
    } else if (monthTasks.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-md);';
        emptyMsg.textContent = `${currentMonth.getMonth() + 1}월에 해당하는 태스크가 없습니다.`;
        container.appendChild(emptyMsg);
    }
}

function createPagination({ current, total, totalItems, label, onPageChange }) {
    const container = document.createElement('div');
    container.className = 'pagination';
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        margin-top: var(--space-sm);
    `;

    container.innerHTML = `
        <button class="pagination__btn" ${current <= 1 ? 'disabled' : ''} data-action="prev">
            ◀ 이전
        </button>
        <span style="color: var(--text-secondary); font-size: 14px;">
            ${label} ${current} / ${total} 페이지 (총 ${totalItems}개)
        </span>
        <button class="pagination__btn" ${current >= total ? 'disabled' : ''} data-action="next">
            다음 ▶
        </button>
    `;

    container.querySelector('[data-action="prev"]').addEventListener('click', () => {
        if (current > 1) onPageChange(current - 1);
    });

    container.querySelector('[data-action="next"]').addEventListener('click', () => {
        if (current < total) onPageChange(current + 1);
    });

    return container;
}

// 임박 태스크 섹션 (5개씩 페이지네이션)
function renderUrgentSection(container, allTasks, onTaskClick, onPing) {
    const totalPages = Math.ceil(allTasks.length / URGENT_PER_PAGE);
    const start = (currentUrgentPage - 1) * URGENT_PER_PAGE;
    const pageTasks = allTasks.slice(start, start + URGENT_PER_PAGE);

    container.innerHTML = '';

    const urgentPanel = createUrgentTasks({
        tasks: pageTasks,
        onTaskClick,
        onPing
    });
    container.appendChild(urgentPanel);

    // 페이지네이션 (태스크가 5개 초과일 때만)
    if (allTasks.length > URGENT_PER_PAGE) {
        const pagination = createPagination({
            current: currentUrgentPage,
            total: totalPages,
            totalItems: allTasks.length,
            label: '임박',
            onPageChange: (newPage) => {
                currentUrgentPage = newPage;
                renderUrgentSection(container, allTasks, onTaskClick, onPing);
            }
        });
        container.appendChild(pagination);
    }
}

// 회의록 섹션 (회의/미팅 관련 키워드 포함된 것)
function renderMeetingSection(container) {
    container.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'card';

    const header = document.createElement('div');
    header.className = 'card__header';
    header.innerHTML = `
        <h2 class="card__title">
            <span class="card__title-icon">📋</span>
            최근 회의/미팅
        </h2>
    `;
    section.appendChild(header);

    // 회의/미팅 관련 키워드 필터링
    const meetingKeywords = ['회의', '회의록', '미팅', '미팅록', 'Meeting', 'meeting'];
    const allItems = [...MockData.epics, ...MockData.tasks];
    const meetingItems = allItems.filter(item =>
        item.title && meetingKeywords.some(keyword => item.title.includes(keyword))
    ).sort((a, b) =>
        new Date(b.lastEditedTime || b.endDate) - new Date(a.lastEditedTime || a.endDate)
    ).slice(0, 10);

    if (meetingItems.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
            <div class="empty-state__icon">📭</div>
            <div class="empty-state__title">최근 회의가 없습니다</div>
        `;
        section.appendChild(empty);
    } else {
        const list = document.createElement('div');
        list.className = 'meeting-list';
        list.style.cssText = 'padding: var(--space-md);';

        meetingItems.forEach(item => {
            const dateStr = item.endDate || item.startDate || item.lastEditedTime;
            const date = dateStr ? new Date(dateStr) : null;
            const dateLabel = date ? `${date.getMonth() + 1}/${date.getDate()}` : '';

            const row = document.createElement('div');
            row.className = 'meeting-item';
            row.style.cssText = `
                display: flex;
                gap: var(--space-sm);
                padding: var(--space-sm) 0;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
            `;
            row.innerHTML = `
                <span style="color: var(--accent-blue); font-weight: 600; min-width: 45px;">${dateLabel}</span>
                <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</span>
            `;
            row.addEventListener('click', () => {
                if (item.notionUrl) window.open(item.notionUrl, '_blank');
            });
            list.appendChild(row);
        });

        section.appendChild(list);
    }

    container.appendChild(section);
}
