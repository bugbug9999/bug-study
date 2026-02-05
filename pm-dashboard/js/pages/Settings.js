/**
 * Settings Page
 */

function renderSettings() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Header
    const header = createHeader({
        onRefresh: () => renderSettings()
    });
    app.appendChild(header);

    // Main content
    const main = document.createElement('main');
    main.className = 'main-content';

    const settings = MockData.getSettings();

    main.innerHTML = `
    <div class="settings">
      <h1 style="font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-xl);">
        ⚙️ 설정
      </h1>
      
      <!-- Slack Settings -->
      <div class="settings__group">
        <h2 class="settings__group-title">슬랙 연동</h2>
        
        <div class="form-field">
          <label class="form-label">웹훅 URL</label>
          <input 
            type="url" 
            class="form-input" 
            id="slack-webhook" 
            placeholder="https://hooks.slack.com/services/..."
            value="${settings.slackWebhookUrl || ''}"
          />
        </div>
        
        <div class="form-field">
          <label class="form-label">알림 채널</label>
          <input 
            type="text" 
            class="form-input" 
            id="slack-channel" 
            placeholder="#pm-dashboard"
            value="${settings.slackChannel || ''}"
          />
        </div>
      </div>
      
      <!-- Notification Settings -->
      <div class="settings__group">
        <h2 class="settings__group-title">알림 설정</h2>
        
        <div class="toggle ${settings.autoNotifyEnabled ? 'is-active' : ''}" id="auto-notify-toggle">
          <span class="toggle__label">자동 알림</span>
          <span class="toggle__switch"></span>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 8px; margin-bottom: var(--space-md);">
          D-2 이하 태스크에 대해 09:00, 19:00에 자동으로 슬랙 알림을 보냅니다
        </p>
        
        <div class="form-field">
          <label class="form-label">알림 시간</label>
          <div style="display: flex; gap: var(--space-sm);">
            <input 
              type="time" 
              class="form-input" 
              id="notify-time-1" 
              value="${settings.notifyTimes?.[0] || '09:00'}"
              style="flex: 1;"
            />
            <input 
              type="time" 
              class="form-input" 
              id="notify-time-2" 
              value="${settings.notifyTimes?.[1] || '19:00'}"
              style="flex: 1;"
            />
          </div>
        </div>
      </div>
      
      <!-- API Settings -->
      <div class="settings__group">
        <h2 class="settings__group-title">API 연동</h2>
        
        <div class="form-field">
          <label class="form-label">Notion API Key</label>
          <input 
            type="password" 
            class="form-input" 
            id="notion-api-key" 
            placeholder="secret_..."
            value="${settings.notionApiKey || ''}"
          />
        </div>
        
        <div class="form-field">
          <label class="form-label">Confluence API Key</label>
          <input 
            type="password" 
            class="form-input" 
            id="confluence-api-key" 
            placeholder="API Key"
            value="${settings.confluenceApiKey || ''}"
          />
        </div>
      </div>
      
      <!-- Save Button -->
      <div style="display: flex; gap: var(--space-md); margin-top: var(--space-xl);">
        <button class="btn btn--primary" id="save-settings">
          💾 저장하기
        </button>
        <button class="btn btn--secondary" id="test-connection">
          🔗 연결 테스트
        </button>
      </div>
      
      <!-- Status Message -->
      <div id="status-message" style="margin-top: var(--space-md); display: none;"></div>
    </div>
  `;

    app.appendChild(main);

    // Event handlers
    const autoNotifyToggle = main.querySelector('#auto-notify-toggle');
    autoNotifyToggle.addEventListener('click', () => {
        autoNotifyToggle.classList.toggle('is-active');
    });

    const saveBtn = main.querySelector('#save-settings');
    const statusMessage = main.querySelector('#status-message');

    saveBtn.addEventListener('click', () => {
        const newSettings = {
            slackWebhookUrl: main.querySelector('#slack-webhook').value,
            slackChannel: main.querySelector('#slack-channel').value,
            autoNotifyEnabled: autoNotifyToggle.classList.contains('is-active'),
            notifyTimes: [
                main.querySelector('#notify-time-1').value,
                main.querySelector('#notify-time-2').value
            ],
            notionApiKey: main.querySelector('#notion-api-key').value,
            confluenceApiKey: main.querySelector('#confluence-api-key').value
        };

        MockData.saveSettings(newSettings);

        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `
      <div style="padding: var(--space-md); background: var(--accent-green-light); border-radius: var(--radius-sm); color: var(--accent-green);">
        ✅ 설정이 저장되었습니다
      </div>
    `;

        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    });

    const testBtn = main.querySelector('#test-connection');
    testBtn.addEventListener('click', async () => {
        testBtn.disabled = true;
        testBtn.innerHTML = '⏳ 테스트 중...';

        await new Promise(resolve => setTimeout(resolve, 1500));

        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `
      <div style="padding: var(--space-md); background: var(--accent-yellow-light); border-radius: var(--radius-sm); color: var(--accent-yellow);">
        ⚠️ 실제 API 연동은 서버 설정 후 가능합니다
      </div>
    `;

        testBtn.disabled = false;
        testBtn.innerHTML = '🔗 연결 테스트';

        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    });

    // Tab navigation (mobile)
    const tabNav = createTabNav();
    app.appendChild(tabNav);
}
