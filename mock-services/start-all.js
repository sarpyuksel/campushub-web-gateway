import { spawn } from 'node:child_process';
for (const s of ['auth', 'club-event', 'registration', 'live-ws']) {
  const p = spawn('node', [`${s}/server.js`], { stdio: 'inherit' });
  p.on('exit', (c) => console.log(`${s} kapandı (${c})`));
}
console.log('Auth :4001  Event :4002  Registration :4003  Live WS :4004');
