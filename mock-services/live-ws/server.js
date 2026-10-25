import { pathToFileURL } from 'node:url';
import http from 'node:http';
import { WebSocketServer } from 'ws';

const ACTIONS = ['VIEW', 'CLICK', 'REGISTER', 'CANCEL'];
const pick = (n) => Math.floor(Math.random() * n);

// Mesaj biçimi: LiveEventMessage { timestamp, userId, eventId, action }
export function build({ rate = Number(process.env.EVENTS_PER_SECOND) || 5, streamOnConnect = process.env.STREAM_ON_CONNECT !== '0' } = {}) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ service: 'live-data-service', status: 'UP', version: '1.0.0' }));
    }
    res.statusCode = 404; res.end();
  });
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', (ws) => {
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const startStream = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return;
        ws.send(JSON.stringify({
          timestamp: new Date().toISOString(),
          userId: 1 + pick(20),
          eventId: 1 + pick(3),
          action: ACTIONS[pick(ACTIONS.length)],
        }));
      }, 1000 / rate);
    };
    if (streamOnConnect) startStream();
    // İsteğe bağlı kontrol: {"type":"start"} / {"type":"stop"}
    ws.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw); } catch { return; }
      if (msg.type === 'start') startStream();
      if (msg.type === 'stop') stop();
    });
    ws.on('close', stop);
  });
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 4004;
  build().listen(port, '0.0.0.0', () => console.log(`live-ws ws://localhost:${port}/live`));
}
