import { pathToFileURL } from 'node:url';
import http from 'node:http';
import { WebSocketServer } from 'ws';

const KINDS = ['registration', 'login', 'checkin', 'message'];

export function build({ rate = Number(process.env.EVENTS_PER_SECOND) || 5 } = {}) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ status: 'ok', service: 'live-mock' }));
    }
    res.statusCode = 404; res.end();
  });
  const wss = new WebSocketServer({ server, path: '/live' });
  let seq = 0;

  wss.on('connection', (ws) => {
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const startStream = () => {
      if (timer) return;
      timer = setInterval(() => {
        ws.send(JSON.stringify({
          type: 'event',
          data: { id: ++seq, kind: KINDS[Math.floor(Math.random() * KINDS.length)], value: Math.floor(Math.random() * 100), timestamp: new Date().toISOString() },
        }));
      }, 1000 / rate);
    };
    ws.send(JSON.stringify({ type: 'hello', rate }));
    ws.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw); } catch { return; }
      if (msg.type === 'start') { startStream(); ws.send(JSON.stringify({ type: 'status', streaming: true })); }
      if (msg.type === 'stop') { stop(); ws.send(JSON.stringify({ type: 'status', streaming: false })); }
    });
    ws.on('close', stop);
  });
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 4004;
  build().listen(port, '0.0.0.0', () => console.log(`live-mock ws://localhost:${port}/live`));
}
