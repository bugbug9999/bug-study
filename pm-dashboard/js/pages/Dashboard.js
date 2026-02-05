/**
 * Dashboard Page
 */

function renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Header
    const header = createHeader({
        onRefresh: () => renderDashboard()
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

    // Epic Timeline
    const epicTimeline = createTimeline({
        epics: MockData.epics,
        onEpicClick: handleEpicClick,
        onTaskClick: handleTaskClick
    });
    epicTimeline.style.marginBottom = 'var(--space-lg)';
    container.appendChild(epicTimeline);

    // Task Timeline
    const taskTimeline = createTaskTimeline({
        tasks: MockData.tasks,
        onTaskClick: handleTaskClick
    });
    container.appendChild(taskTimeline);
}
