/**
 * PM Dashboard - Main Entry Point
 */

// Register routes
Router.register('/', renderDashboard);
Router.register('/epics', renderEpicsList);
Router.register('/epic/:id', renderEpicDetail);
Router.register('/settings', renderSettings);

// Initialize router
Router.init();

console.log('🎯 PM Dashboard initialized');
