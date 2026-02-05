/**
 * Ping Button Component
 */

function createPingButton(task, onPing) {
    const button = document.createElement('button');
    button.className = 'btn-ping';
    button.innerHTML = `
    <span>📣</span>
    <span>핑</span>
  `;

    button.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (button.classList.contains('btn-ping--sending')) return;

        button.classList.add('btn-ping--sending');
        button.innerHTML = `<span>⏳</span><span>전송중...</span>`;

        try {
            if (onPing) await onPing(task);
            button.innerHTML = `<span>✅</span><span>완료!</span>`;
            setTimeout(() => {
                button.classList.remove('btn-ping--sending');
                button.innerHTML = `<span>📣</span><span>핑</span>`;
            }, 2000);
        } catch (error) {
            button.innerHTML = `<span>❌</span><span>실패</span>`;
            setTimeout(() => {
                button.classList.remove('btn-ping--sending');
                button.innerHTML = `<span>📣</span><span>핑</span>`;
            }, 2000);
        }
    });

    return button;
}

/**
 * 슬랙 웹훅으로 핑 메시지 전송 (모의)
 */
async function sendSlackPing(task, epic, webhookUrl) {
    console.log('Slack ping sent for:', task.title);
    // 모의 전송
    return new Promise(resolve => setTimeout(resolve, 1000));
}
