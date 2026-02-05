/**
 * PM Dashboard - Main Entry Point
 */

// 데이터 로드 후 라우터 초기화
async function initApp() {
    // 노션 데이터 먼저 로드
    await MockData.refresh();

    // Register routes
    Router.register('/', renderDashboard);
    Router.register('/epics', renderEpicsList);
    Router.register('/epic/:id', renderEpicDetail);
    Router.register('/settings', renderSettings);

    // Initialize router
    Router.init();

    console.log('🎯 PM Dashboard initialized');
}

// 앱 초기화
initApp();
