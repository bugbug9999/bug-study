/**
 * Notion Data Sync Script
 * 속성 타입을 자동으로 감지하여 데이터 파싱
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const EPIC_DB_ID = process.env.NOTION_EPIC_DB;
const TASK_DB_ID = process.env.NOTION_TASK_DB;
const DOCS_DB_ID = process.env.NOTION_DOCS_DB;

const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// 데이터베이스 스키마 가져오기 (자동 속성 감지용)
async function getDatabaseSchema(databaseId, name) {
    try {
        const db = await notion.databases.retrieve({ database_id: databaseId });
        console.log(`📊 ${name} DB schema loaded`);
        return db.properties;
    } catch (error) {
        console.error(`❌ Error getting ${name} schema:`, error.message);
        return {};
    }
}

// 속성 타입별로 분류
function categorizeProperties(schema) {
    const categories = {
        title: null,
        date: [],
        person: [],
        relation: [],
        status: null,
        select: [],
        multiSelect: [],
        url: [],
        text: []
    };

    for (const [name, prop] of Object.entries(schema)) {
        switch (prop.type) {
            case 'title':
                categories.title = name;
                break;
            case 'date':
                categories.date.push(name);
                break;
            case 'people':
                categories.person.push(name);
                break;
            case 'relation':
                categories.relation.push(name);
                break;
            case 'status':
                categories.status = name;
                break;
            case 'select':
                categories.select.push(name);
                break;
            case 'multi_select':
                categories.multiSelect.push(name);
                break;
            case 'url':
                categories.url.push(name);
                break;
            case 'rich_text':
                categories.text.push(name);
                break;
        }
    }

    console.log(`   📋 Found: title=${categories.title}, dates=${categories.date.length}, people=${categories.person.length}, relations=${categories.relation.length}`);
    return categories;
}

async function fetchDatabase(databaseId, name) {
    console.log(`📥 Fetching ${name} database...`);

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 100,
        });

        console.log(`   ✅ Found ${response.results.length} items`);
        return response.results;
    } catch (error) {
        console.error(`   ❌ Error fetching ${name}:`, error.message);
        return [];
    }
}

// 스마트 파싱 - 스키마 기반
function parseItem(page, schema, categories, type) {
    const props = page.properties;

    // Title 자동 감지
    const title = getTitle(props, categories.title);

    // Date 자동 감지 (첫 번째 date 타입 속성 사용)
    const dateRange = categories.date.length > 0
        ? getDateRange(props[categories.date[0]])
        : { start: null, end: null };

    // Status 자동 감지
    const status = categories.status
        ? getStatus(props[categories.status])
        : findSelectByName(props, ['Status', '상태', 'status']);

    // Person 자동 감지 (Assignee 우선, 없으면 첫 번째)
    const assigneeProp = findProperty(props, categories.person, ['Assignee', '담당자', 'assignee']);
    const assignee = getPerson(props[assigneeProp]);

    // Reviewer 감지
    const reviewerProp = findProperty(props, categories.person, ['Reviewer', '리뷰어', 'reviewer']);
    const reviewer = reviewerProp !== assigneeProp ? getPerson(props[reviewerProp]) : null;

    // Relation 자동 감지 (Epic 연결)
    const epicRelation = findProperty(props, categories.relation, ['Related to Epic', 'Epic', '에픽', '상위 에픽']);
    const epicId = epicRelation ? getRelation(props[epicRelation]) : null;

    // Select 속성들
    const priorityProp = findProperty(props, categories.select, ['Priority', '우선순위', 'priority']);
    const priority = priorityProp ? getSelectValue(props[priorityProp]) : null;

    const baseParsed = {
        id: page.id,
        title,
        status,
        startDate: dateRange.start,
        endDate: dateRange.end,
        assignee,
        reviewer,
        notionUrl: page.url,
        priority,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
    };

    if (type === 'task') {
        baseParsed.epicId = epicId;
        baseParsed.pingHistory = [];
    }

    return baseParsed;
}

// 헬퍼 함수들
function findProperty(props, candidates, preferredNames) {
    // 먼저 선호하는 이름으로 찾기
    for (const name of preferredNames) {
        if (props[name]) return name;
    }
    // 없으면 첫 번째 후보 반환
    for (const name of candidates) {
        if (props[name]) return name;
    }
    return null;
}

function getTitle(props, titleProp) {
    if (titleProp && props[titleProp]) {
        const prop = props[titleProp];
        if (prop.title && prop.title.length > 0) {
            return prop.title.map(t => t.plain_text).join('');
        }
    }
    // 폴백: 모든 속성에서 title 타입 찾기
    for (const [key, value] of Object.entries(props)) {
        if (value.type === 'title' && value.title && value.title.length > 0) {
            return value.title.map(t => t.plain_text).join('');
        }
    }
    return '';
}

function getDateRange(prop) {
    if (!prop || !prop.date) return { start: null, end: null };
    return {
        start: prop.date.start || null,
        end: prop.date.end || prop.date.start || null
    };
}

function getStatus(prop) {
    if (!prop) return 'To Do';
    if (prop.status) return prop.status.name || 'To Do';
    return 'To Do';
}

function getSelectValue(prop) {
    if (!prop || !prop.select) return null;
    return prop.select.name || null;
}

function findSelectByName(props, names) {
    for (const name of names) {
        if (props[name]) {
            if (props[name].select) return props[name].select.name || 'To Do';
            if (props[name].status) return props[name].status.name || 'To Do';
        }
    }
    return 'To Do';
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

async function main() {
    console.log('🚀 Starting Smart Notion sync...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Epic 처리
    const epicSchema = await getDatabaseSchema(EPIC_DB_ID, 'Epics');
    const epicCategories = categorizeProperties(epicSchema);
    const epicPages = await fetchDatabase(EPIC_DB_ID, 'Epics');
    const epics = epicPages.map(p => parseItem(p, epicSchema, epicCategories, 'epic')).filter(e => e.title);
    console.log(`   ✅ Parsed ${epics.length} epics\n`);

    // Task 처리
    const taskSchema = await getDatabaseSchema(TASK_DB_ID, 'Tasks');
    const taskCategories = categorizeProperties(taskSchema);
    const taskPages = await fetchDatabase(TASK_DB_ID, 'Tasks');
    const tasks = taskPages.map(p => parseItem(p, taskSchema, taskCategories, 'task')).filter(t => t.title);
    console.log(`   ✅ Parsed ${tasks.length} tasks\n`);

    // Docs 처리
    const docsSchema = await getDatabaseSchema(DOCS_DB_ID, 'Docs');
    const docsCategories = categorizeProperties(docsSchema);
    const docsPages = await fetchDatabase(DOCS_DB_ID, 'Docs');
    const docs = docsPages.map(p => parseItem(p, docsSchema, docsCategories, 'doc')).filter(d => d.title);
    console.log(`   ✅ Parsed ${docs.length} docs\n`);

    // 저장
    const data = {
        epics,
        tasks,
        docs,
        members: extractMembers(epics, tasks),
        syncedAt: new Date().toISOString(),
    };

    const outputPath = path.join(OUTPUT_DIR, 'notion-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`\n🎉 Data saved!`);
    console.log(`   - ${epics.length} epics`);
    console.log(`   - ${tasks.length} tasks`);
    console.log(`   - ${docs.length} docs`);
    console.log(`   - ${data.members.length} members`);
}

function extractMembers(epics, tasks) {
    const memberMap = new Map();
    [...epics, ...tasks].forEach(item => {
        if (item.assignee?.id) memberMap.set(item.assignee.id, item.assignee);
        if (item.reviewer?.id) memberMap.set(item.reviewer.id, item.reviewer);
    });
    return Array.from(memberMap.values());
}

main().catch(console.error);
