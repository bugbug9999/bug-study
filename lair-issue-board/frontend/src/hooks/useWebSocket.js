import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

export default function useWebSocket() {
  const wsRef = useRef(null);
  const { addIssue, updateIssueInStore } = useStore();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const { event: evtType, data } = JSON.parse(event.data);
          switch (evtType) {
            case 'issue:created':
              addIssue(data);
              break;
            case 'issue:updated':
              updateIssueInStore(data);
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };
    }

    connect();
    return () => wsRef.current?.close();
  }, [addIssue, updateIssueInStore]);
}
