/**
 * Mock Data for PM Dashboard
 * 노션 데이터가 없으면 목업 사용, 있으면 노션 데이터 로드
 */

const MockData = (function () {
    // 현재 날짜 기준으로 동적 날짜 생성
    const today = new Date();
    const addDays = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    // 기본 목업 멤버 데이터
    let members = [
        { id: 'user1', name: '홍길동', avatar: null, slackId: '@hong' },
        { id: 'user2', name: '김철수', avatar: null, slackId: '@kim' },
        { id: 'user3', name: '이영희', avatar: null, slackId: '@lee' },
        { id: 'user4', name: '박지민', avatar: null, slackId: '@park' },
        { id: 'user5', name: '정수진', avatar: null, slackId: '@jung' },
    ];

    // 기본 목업 에픽 데이터
    let epics = [
        {
            id: 'epic1',
            title: '사용자 인증 시스템',
            type: 'Epic',
            status: 'In Progress',
            startDate: addDays(-14),
            endDate: addDays(21),
            assignee: members[0],
            reviewer: members[1],
            confluenceUrl: 'https://confluence.example.com/auth-system',
            confluenceSummary: '사용자 인증 및 권한 관리 시스템 설계 문서.',
            notionUrl: 'https://notion.so/auth-system',
        },
        {
            id: 'epic2',
            title: '대시보드 UI 개선',
            type: 'Epic',
            status: 'Review',
            startDate: addDays(-7),
            endDate: addDays(7),
            assignee: members[2],
            reviewer: members[0],
            confluenceUrl: null,
            notionUrl: 'https://notion.so/dashboard-ui',
        },
    ];

    // 기본 목업 태스크 데이터
    let tasks = [
        {
            id: 'task1',
            title: 'OAuth 2.0 구글 로그인 구현',
            type: 'Task',
            status: 'Done',
            startDate: addDays(-14),
            endDate: addDays(-7),
            assignee: members[0],
            reviewer: members[1],
            epicId: 'epic1',
            notionUrl: 'https://notion.so/google-oauth',
            pingHistory: [],
        },
        {
            id: 'task2',
            title: 'JWT 토큰 인증 미들웨어',
            type: 'Task',
            status: 'In Progress',
            startDate: addDays(-5),
            endDate: addDays(2),
            assignee: members[0],
            reviewer: members[1],
            epicId: 'epic1',
            notionUrl: 'https://notion.so/jwt-auth',
            pingHistory: [],
        },
    ];

    let docs = [];
    let syncedAt = null;
    let isLoaded = false;

    // 노션 데이터 로드 시도
    async function loadNotionData() {
        if (isLoaded) return;

        try {
            const response = await fetch('./data/notion-data.json');
            if (response.ok) {
                const data = await response.json();

                console.log('📦 Raw Notion data:', {
                    epics: data.epics?.length || 0,
                    tasks: data.tasks?.length || 0
                });

                // 노션 데이터가 있으면 사용 (빈 배열이라도 동기화된 데이터이므로 사용)
                if (data.epics) {
                    epics = data.epics;
                }
                if (data.tasks) {
                    tasks = data.tasks;
                }
                if (data.members && data.members.length > 0) {
                    members = data.members;
                }
                if (data.docs) {
                    docs = data.docs;
                }
                syncedAt = data.syncedAt;

                console.log('✅ Notion data loaded:', {
                    epics: epics.length,
                    tasks: tasks.length,
                    members: members.length,
                    syncedAt
                });
            } else {
                console.log('⚠️ Failed to fetch notion-data.json:', response.status);
            }
        } catch (error) {
            console.log('📋 Using mock data (Notion data not available):', error.message);
        }

        isLoaded = true;
    }

    // 초기 로드는 main.js에서 명시적으로 호출
    // loadNotionData(); // 제거됨

    return {
        get members() { return members; },
        get epics() { return epics; },
        get tasks() { return tasks; },
        get docs() { return docs; },
        get syncedAt() { return syncedAt; },

        async refresh() {
            isLoaded = false;
            await loadNotionData();
            return { epics, tasks, members, docs };
        },

        getTasksByEpic(epicId) {
            return tasks.filter(task => task.epicId === epicId);
        },

        getEpicById(epicId) {
            return epics.find(epic => epic.id === epicId) || null;
        },

        getTaskById(taskId) {
            return tasks.find(task => task.id === taskId) || null;
        },

        getUrgentTasks() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return tasks.filter(task => {
                if (task.status === 'Done') return false;
                if (!task.endDate) return false;

                const endDate = new Date(task.endDate);
                endDate.setHours(0, 0, 0, 0);

                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 2;
            }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        },

        getTimelineRange() {
            const validEpics = epics.filter(e => e.startDate && e.endDate);
            const validTasks = tasks.filter(t => t.startDate && t.endDate);

            if (validEpics.length === 0 && validTasks.length === 0) {
                const today = new Date();
                const start = new Date(today);
                start.setMonth(start.getMonth() - 1);
                const end = new Date(today);
                end.setMonth(end.getMonth() + 2);
                return { start, end };
            }

            const allDates = [
                ...validEpics.map(e => new Date(e.startDate)),
                ...validEpics.map(e => new Date(e.endDate)),
                ...validTasks.map(t => new Date(t.startDate)),
                ...validTasks.map(t => new Date(t.endDate)),
            ];

            const minDate = new Date(Math.min(...allDates));
            const maxDate = new Date(Math.max(...allDates));

            minDate.setDate(1);
            maxDate.setMonth(maxDate.getMonth() + 1);
            maxDate.setDate(0);

            return { start: minDate, end: maxDate };
        },

        getSettings() {
            const defaults = {
                slackWebhookUrl: '',
                slackChannel: '#pm-dashboard',
                autoNotifyEnabled: true,
                notifyTimes: ['09:00', '19:00'],
                notionApiKey: '',
                confluenceApiKey: '',
            };

            try {
                const saved = localStorage.getItem('pm-dashboard-settings');
                return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
            } catch {
                return defaults;
            }
        },

        saveSettings(settings) {
            localStorage.setItem('pm-dashboard-settings', JSON.stringify(settings));
        }
    };
})();
