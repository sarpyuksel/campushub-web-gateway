import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build as auth } from '../auth/server.js';
import { build as event } from '../club-event/server.js';
import { build as reg } from '../registration/server.js';
import { build as live } from '../live-ws/server.js';
import { WebSocket } from 'ws';

const login = async (a) => (await a.inject({ method: 'POST', url: '/login', payload: { email: 'test@campus.edu', password: '123456' } })).json().token;

test('auth: login başarılı / hatalı', async () => {
  const a = auth();
  assert.ok(await login(a));
  const bad = await a.inject({ method: 'POST', url: '/login', payload: { email: 'x', password: 'y' } });
  assert.equal(bad.statusCode, 401);
});

test('auth: aynı e-posta ile ikinci kayıt 409', async () => {
  const a = auth();
  const p = { name: 'A', email: 'a@a.com', password: '1' };
  assert.equal((await a.inject({ method: 'POST', url: '/register', payload: p })).statusCode, 201);
  assert.equal((await a.inject({ method: 'POST', url: '/register', payload: p })).statusCode, 409);
});

test('event: liste ve 404', async () => {
  const e = event();
  assert.equal((await e.inject('/events')).json().length, 3);
  assert.equal((await e.inject('/events/yok')).statusCode, 404);
});

test('registration: token yok 401', async () => {
  const r = reg();
  assert.equal((await r.inject({ method: 'GET', url: '/registrations/me' })).statusCode, 401);
});

test('registration: kayıt, çift kayıt, kapasite dolu', async () => {
  const [a, r] = [auth(), reg()];
  const h = { authorization: `Bearer ${await login(a)}` };
  const post = (eventId) => r.inject({ method: 'POST', url: '/registrations', headers: h, payload: { eventId } });
  assert.equal((await post('e2')).statusCode, 201);
  assert.equal((await post('e2')).statusCode, 409);
  const full = await post('e3');
  assert.equal(full.statusCode, 409);
  assert.equal(full.json().error, 'event_full');
  assert.equal((await r.inject({ method: 'GET', url: '/registrations/me', headers: h })).json().length, 1);
});

test('hata bayrağı: ?fail=503 ve /health etkilenmez', async () => {
  const e = event();
  assert.equal((await e.inject('/events?fail=503')).statusCode, 503);
  assert.equal((await e.inject('/events?fail=500')).statusCode, 500);
  assert.equal((await e.inject('/health?fail=500')).statusCode, 200);
});

test('live ws: start ile olay gelir, stop ile durur', async () => {
  const s = live({ rate: 50 });
  await new Promise((r) => s.listen(0, r));
  const ws = new WebSocket(`ws://localhost:${s.address().port}/live`);
  const msgs = [];
  ws.on('message', (m) => msgs.push(JSON.parse(m)));
  await new Promise((r) => ws.on('open', r));
  ws.send(JSON.stringify({ type: 'start' }));
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(msgs.filter((m) => m.type === 'event').length >= 5);
  ws.send(JSON.stringify({ type: 'stop' }));
  await new Promise((r) => setTimeout(r, 100));
  const n = msgs.length;
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(msgs.length, n);
  ws.close(); s.close();
});
