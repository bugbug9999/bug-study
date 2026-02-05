/**
 * PM Dashboard - Main Entry Point
 */

// 로딩 표시
document.getElementById('app').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-size:18px;">로딩 중...</div>';

// 데이터 로드 후 라우터 초기화
async function initApp() {
    console.log('🔄 Loading data...');

    // 노션 데이터 먼저 로드
    await MockData.refresh();

    console.log('🎯 PM Dashboard initialized');

    // Register routes
    Router.register('/', renderDashboard);
    Router.register('/epics', renderEpicsList);
    Router.register('/epic/:id', renderEpicDetail);
    Router.register('/settings', renderSettings);

    // Initialize router
    Router.init();
}

// 앱 초기화
initApp();
