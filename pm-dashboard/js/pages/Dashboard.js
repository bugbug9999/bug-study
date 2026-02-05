/**
 * Dashboard Page with 30-day filter and pagination
 */

let currentEpicPage = 1;
let currentTaskPage = 1;
const ITEMS_PER_PAGE = 10;

function renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Reset pagination
    currentEpicPage = 1;
    currentTaskPage = 1;

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

    // Urgent Tasks Panel
    const urgentPanel = createUrgentTasks({
        tasks: urgentTasks,
        onTaskClick: handleTaskClick,
        onPing: handlePing
    });
    container.appendChild(urgentPanel);

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

function renderEpicTimeline(container, onEpicClick, onTaskClick) {
    const { items, total, page, totalPages } = MockData.getEpicsPaginated(currentEpicPage, ITEMS_PER_PAGE);

    container.innerHTML = '';

    // Create timeline
    const timeline = createTimeline({
        epics: items,
        onEpicClick,
        onTaskClick
    });
    timeline.style.marginBottom = 'var(--space-md)';
    container.appendChild(timeline);

    // Pagination info and controls
    if (total > ITEMS_PER_PAGE) {
        const pagination = createPagination({
            current: page,
            total: totalPages,
            totalItems: total,
            label: '에픽',
            onPageChange: (newPage) => {
                currentEpicPage = newPage;
                renderEpicTimeline(container, onEpicClick, onTaskClick);
            }
        });
        container.appendChild(pagination);
    } else if (total === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-md);';
        emptyMsg.textContent = '최근 30일 이내 에픽이 없습니다.';
        container.appendChild(emptyMsg);
    }
}

function renderTaskTimeline(container, onTaskClick) {
    const { items, total, page, totalPages } = MockData.getTasksPaginated(currentTaskPage, ITEMS_PER_PAGE);

    container.innerHTML = '';

    // Create timeline
    const timeline = createTaskTimeline({
        tasks: items,
        onTaskClick
    });
    container.appendChild(timeline);

    // Pagination info and controls
    if (total > ITEMS_PER_PAGE) {
        const pagination = createPagination({
            current: page,
            total: totalPages,
            totalItems: total,
            label: '태스크',
            onPageChange: (newPage) => {
                currentTaskPage = newPage;
                renderTaskTimeline(container, onTaskClick);
            }
        });
        container.appendChild(pagination);
    } else if (total === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: var(--space-md);';
        emptyMsg.textContent = '최근 30일 이내 태스크가 없습니다.';
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
