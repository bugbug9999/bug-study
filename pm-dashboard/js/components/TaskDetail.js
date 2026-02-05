/**
 * Task Detail Side Panel Component
 */

let currentPanel = null;
let currentOverlay = null;

function createTaskDetail(options = {}) {
    const { task, onClose, onPing } = options;

    // Close any existing panel
    closePanel();

    const epic = MockData.getEpicById(task.epicId);
    const dday = DateUtils.calculateDday(task.endDate);
    const isUrgent = dday <= 2 && dday >= 0 && task.status !== 'Done';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'side-panel__overlay';
    document.body.appendChild(overlay);
    currentOverlay = overlay;

    // Create panel
    const panel = document.createElement('aside');
    panel.className = 'side-panel';
    panel.innerHTML = `
    <div class="side-panel__header">
      <h2 class="side-panel__title">${task.title}</h2>
      <button class="side-panel__close" id="close-panel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="side-panel__body">
      <!-- Status Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">상태</div>
        <div class="side-panel__section-content">
          <span class="status-badge status-badge--${task.status.toLowerCase().replace(' ', '')}">
            ${task.status}
          </span>
          ${isUrgent ? '<span style="margin-left: 8px; color: var(--accent-red);">🔥 임박</span>' : ''}
        </div>
      </div>
      
      <!-- Basic Info Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">기본 정보</div>
        <div class="side-panel__section-content">
          <div class="info-row">
            <span class="info-row__label">에픽</span>
            <span class="info-row__value">${epic?.title || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">시작일</span>
            <span class="info-row__value">${DateUtils.formatDateKorean(task.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">마감일</span>
            <span class="info-row__value">
              ${DateUtils.formatDateKorean(task.endDate)}
              <span style="margin-left: 8px; color: ${isUrgent ? 'var(--accent-red)' : 'var(--text-secondary)'}; font-weight: 600;">
                (${DateUtils.formatDday(dday)})
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <!-- People Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">담당자 정보</div>
        <div class="side-panel__section-content">
          <div class="info-row">
            <span class="info-row__label">담당자</span>
            <span class="info-row__value">
              <div class="person-info">
                <div class="avatar avatar--sm">${getInitials(task.assignee?.name)}</div>
                <span class="person-info__name">${task.assignee?.name || '-'}</span>
              </div>
            </span>
          </div>
          <div class="info-row">
            <span class="info-row__label">리뷰어</span>
            <span class="info-row__value">
              <div class="person-info">
                <div class="avatar avatar--sm">${getInitials(task.reviewer?.name)}</div>
                <span class="person-info__name">${task.reviewer?.name || '-'}</span>
              </div>
            </span>
          </div>
        </div>
      </div>
      
      <!-- Links Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">관련 링크</div>
        <div class="side-panel__section-content" style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${task.notionUrl ? `
            <a href="${task.notionUrl}" target="_blank" class="link-btn">
              <span>📝</span>
              <span>노션</span>
            </a>
          ` : ''}
          ${task.confluenceUrl ? `
            <a href="${task.confluenceUrl}" target="_blank" class="link-btn">
              <span>📎</span>
              <span>컨플루언스</span>
            </a>
          ` : ''}
          ${!task.notionUrl && !task.confluenceUrl ? '<span style="color: var(--text-tertiary);">연결된 문서가 없습니다</span>' : ''}
        </div>
      </div>
      
      <!-- Ping Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">핑 보내기</div>
        <div class="side-panel__section-content" id="ping-section">
          <div style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px;">
            ${task.status === 'Review' ? '리뷰어에게' : '담당자에게'} 슬랙 알림을 보냅니다
          </div>
        </div>
      </div>
      
      <!-- Ping History Section -->
      <div class="side-panel__section">
        <div class="side-panel__section-title">핑 히스토리</div>
        <div class="side-panel__section-content">
          ${task.pingHistory && task.pingHistory.length > 0 ? `
            <div class="ping-history">
              ${task.pingHistory.map(ping => `
                <div class="ping-history__item">
                  <span class="ping-history__time">${formatPingTime(ping.time)}</span>
                  <span class="ping-history__target">→ ${ping.target?.name || 'Unknown'}</span>
                </div>
              `).join('')}
            </div>
          ` : '<span style="color: var(--text-tertiary);">핑 기록이 없습니다</span>'}
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(panel);
    currentPanel = panel;

    // Add ping button
    const pingSection = panel.querySelector('#ping-section');
    const pingBtn = createPingButton(task, () => onPing?.(task, epic));
    pingSection.appendChild(pingBtn);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('is-visible');
        panel.classList.add('is-open');
    });

    // Close handlers
    const closeBtn = panel.querySelector('#close-panel');
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closePanel();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    return panel;
}

function closePanel() {
    if (currentPanel) {
        currentPanel.classList.remove('is-open');
        currentPanel.addEventListener('transitionend', () => {
            currentPanel?.remove();
            currentPanel = null;
        }, { once: true });
    }
    if (currentOverlay) {
        currentOverlay.classList.remove('is-visible');
        currentOverlay.addEventListener('transitionend', () => {
            currentOverlay?.remove();
            currentOverlay = null;
        }, { once: true });
    }
}

function formatPingTime(timeStr) {
    const date = new Date(timeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
}
