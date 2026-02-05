/**
 * Notion Data Sync Script
 * GitHub Actions에서 실행되어 노션 데이터를 JSON으로 저장
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// 환경변수에서 설정 로드
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const EPIC_DB_ID = process.env.NOTION_EPIC_DB;
const TASK_DB_ID = process.env.NOTION_TASK_DB;
const DOCS_DB_ID = process.env.NOTION_DOCS_DB;

// 출력 경로
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

async function fetchDatabase(databaseId, name) {
    console.log(`📥 Fetching ${name} database...`);

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 100,
        });

        console.log(`   ✅ Found ${response.results.length} items`);

        // 디버깅: 첫 번째 아이템의 속성 이름 출력
        if (response.results.length > 0) {
            const firstItem = response.results[0];
            console.log(`   📋 Property names:`, Object.keys(firstItem.properties));
        }

        return response.results;
    } catch (error) {
        console.error(`   ❌ Error fetching ${name}:`, error.message);
        return [];
    }
}

function parseEpic(page) {
    const props = page.properties;

    // 날짜 처리 - Date 속성 하나로 시작/종료일 모두 포함 가능
    const dateRange = getDateRange(props['Date'] || props['date']);

    return {
        id: page.id,
        title: getTitle(props),
        status: getSelect(props['Status'] || props['상태']),
        startDate: dateRange.start,
        endDate: dateRange.end,
        assignee: getPerson(props['Assignee'] || props['담당자']),
        reviewer: getPerson(props['Reviewer'] || props['리뷰어']),
        notionUrl: page.url,
        team: getSelect(props['Team']),
        productPart: getSelect(props['Product/Part']),
        priority: getSelect(props['Priority']),
        productStage: getSelect(props['Product Stage']),
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
    };
}

function parseTask(page) {
    const props = page.properties;

    // 날짜 처리 - Date 속성 하나로 시작/종료일 모두 포함 가능
    const dateRange = getDateRange(props['Date'] || props['date']);

    return {
        id: page.id,
        title: getTitle(props),
        status: getSelect(props['Status'] || props['상태']),
        startDate: dateRange.start,
        endDate: dateRange.end,
        assignee: getPerson(props['Assignee'] || props['담당자']),
        reviewer: getPerson(props['Reviewer'] || props['리뷰어']),
        epicId: getRelation(props['Related to Epic'] || props['Related to Epics/...'] || props['상위 에픽']),
        notionUrl: page.url,
        productPart: getSelect(props['Product/Part']),
        priority: getSelect(props['Priority']),
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
        pingHistory: [],
    };
}

function parseDocs(page) {
    const props = page.properties;

    // 날짜 처리
    const dateRange = getDateRange(props['date'] || props['Date']);

    return {
        id: page.id,
        title: getTitle(props),
        url: page.url,
        type: getSelect(props['Type']),
        date: dateRange.start,
        linkedEpic: getRelation(props['Related to Epics/...'] || props['Related to Epic']),
        linkedTask: getRelation(props['Related to Tasks']),
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
    };
}

// Property 파싱 헬퍼 함수들
function getTitle(props) {
    // 모든 속성을 순회하며 title 타입 찾기
    for (const [key, value] of Object.entries(props)) {
        if (value.type === 'title' && value.title && value.title.length > 0) {
            return value.title.map(t => t.plain_text).join('');
        }
    }
    return '';
}

function getSelect(prop) {
    if (!prop) return 'To Do';
    if (prop.select) return prop.select.name || 'To Do';
    if (prop.status) return prop.status.name || 'To Do';
    return 'To Do';
}

function getDateRange(prop) {
    if (!prop || !prop.date) return { start: null, end: null };
    return {
        start: prop.date.start || null,
        end: prop.date.end || prop.date.start || null  // end가 없으면 start 사용
    };
}

function getPerson(prop) {
    if (!prop || !prop.people || prop.people.length === 0) return null;
    const person = prop.people[0];
    return {
        id: person.id,
        name: person.name || 'Unknown',
        avatar: person.avatar_url || null,
    };
}

function getRelation(prop) {
    if (!prop || !prop.relation || prop.relation.length === 0) return null;
    return prop.relation[0].id;
}

function getUrl(prop) {
    if (!prop || !prop.url) return null;
    return prop.url;
}

async function main() {
    console.log('🚀 Starting Notion sync...\n');

    // 출력 디렉토리 생성
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Epic 데이터 가져오기
    const epicPages = await fetchDatabase(EPIC_DB_ID, 'Epics');
    const epics = epicPages.map(parseEpic).filter(e => e.title);
    console.log(`   Parsed ${epics.length} epics with titles`);

    // Task 데이터 가져오기
    const taskPages = await fetchDatabase(TASK_DB_ID, 'Tasks');
    const tasks = taskPages.map(parseTask).filter(t => t.title);
    console.log(`   Parsed ${tasks.length} tasks with titles`);

    // Docs 데이터 가져오기
    const docsPages = await fetchDatabase(DOCS_DB_ID, 'Docs');
    const docs = docsPages.map(parseDocs).filter(d => d.title);
    console.log(`   Parsed ${docs.length} docs with titles`);

    // 데이터 저장
    const data = {
        epics,
        tasks,
        docs,
        members: extractMembers(epics, tasks),
        syncedAt: new Date().toISOString(),
    };

    const outputPath = path.join(OUTPUT_DIR, 'notion-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`\n✅ Data saved to ${outputPath}`);
    console.log(`   - ${epics.length} epics`);
    console.log(`   - ${tasks.length} tasks`);
    console.log(`   - ${docs.length} docs`);
    console.log(`   - ${data.members.length} members`);
}

function extractMembers(epics, tasks) {
    const memberMap = new Map();

    [...epics, ...tasks].forEach(item => {
        if (item.assignee && item.assignee.id) {
            memberMap.set(item.assignee.id, item.assignee);
        }
        if (item.reviewer && item.reviewer.id) {
            memberMap.set(item.reviewer.id, item.reviewer);
        }
    });

    return Array.from(memberMap.values());
}

main().catch(console.error);
