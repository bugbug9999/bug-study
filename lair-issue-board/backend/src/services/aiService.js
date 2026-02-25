const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an AI assistant for the Lair Issue Board system. Your job is to analyze raw issue reports from team members and produce structured issue data.

You must respond with valid JSON only. No markdown, no explanation, just the JSON object.

The JSON must have these fields:
- title: A concise one-line Korean summary of the issue (max 80 chars)
- category: One of "bug", "ux_ui", "feature", "performance", "other"
- priority: One of "P0" (service down / asset loss risk), "P1" (core feature broken / many users affected), "P2" (inconvenient but has workaround), "P3" (nice to have improvement)
- description: A cleaned-up, detailed Korean description that preserves the original meaning but adds context and structure. Use markdown formatting.
- resolution_suggestion: A concrete Korean solution proposal with actionable steps. Use markdown bullet points.
- related_keywords: An array of keywords to search for related issues`;

async function processIssue(issueId, rawInput, source, chain, version) {
  // Log start
  await db.query(
    `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'processing')`,
    [issueId, 'classification_start', 'AI 분류 작업 시작']
  );

  await db.query(
    `UPDATE issues SET ai_status = 'processing' WHERE id = $1`,
    [issueId]
  );

  try {
    const userMessage = `다음 이슈 제보를 분석해주세요:

원문: "${rawInput}"
${source ? `출처: ${source}` : ''}
${chain ? `체인: ${chain}` : ''}
${version ? `버전: ${version}` : ''}

위 내용을 바탕으로 구조화된 이슈 JSON을 생성해주세요.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);

    // Update issue with AI results
    await db.query(
      `UPDATE issues SET
        title = $2,
        category = $3,
        priority = $4,
        description = $5,
        resolution_suggestion = $6,
        ai_status = 'completed',
        ai_processed_at = NOW(),
        status = 'review'
       WHERE id = $1`,
      [
        issueId,
        parsed.title,
        parsed.category,
        parsed.priority,
        parsed.description,
        parsed.resolution_suggestion,
      ]
    );

    // Log completion
    const categoryLabel = {
      bug: 'Bug', ux_ui: 'UX/UI', feature: 'Feature',
      performance: 'Performance', other: 'Other',
    }[parsed.category] || parsed.category;

    await db.query(
      `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
      [issueId, 'classification_complete', `이슈 분류 완료 → ${categoryLabel} / ${parsed.priority}`]
    );

    await db.query(
      `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'completed')`,
      [issueId, 'resolution_drafted', '해결 방향 초안 작성 완료']
    );

    return { success: true, data: parsed };
  } catch (err) {
    console.error('[AI] Processing failed:', err.message);

    await db.query(
      `UPDATE issues SET ai_status = 'failed' WHERE id = $1`,
      [issueId]
    );

    await db.query(
      `INSERT INTO ai_logs (issue_id, action, detail, status) VALUES ($1, $2, $3, 'failed')`,
      [issueId, 'classification_failed', `AI 처리 실패: ${err.message}`]
    );

    return { success: false, error: err.message };
  }
}

module.exports = { processIssue };
