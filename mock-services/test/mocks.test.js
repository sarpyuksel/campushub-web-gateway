import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build as auth } from '../auth/server.js';
import { build as event } from '../club-event/server.js';
import { build as reg } from '../registration/server.js';
import { build as live } from '../live-ws/server.js';
import { signToken } from '../shared/common.js';
import { WebSocket } from 'ws';

const login = async (a) => (await a.inject({ method: 'POST', url: '/login', payload: { email: 'test@campus.edu', password: '123456' } })).json();

test('auth: login LoginResponse döner, yanlış şifre 401', async () => {
  const a = auth();
  const body = await login(a);
  assert.equal(typeof body.token, 'string');
  assert.equal(body.userId, 1);
  const bad = await a.inject({ method: 'POST', url: '/login', payload: { email: 'x', password: 'y' } });
  assert.equal(bad.statusCode, 401);
  assert.equal(bad.json().error, 'INVALID_CREDENTIALS');
});

test('auth: register UserResponse döner, aynı e-posta 409', async () => {
  const a = auth();
  const p = { name: 'A', email: 'a@a.com', password: '1' };
  const ok = await a.inject({ method: 'POST', url: '/register', payload: p });
  assert.equal(ok.statusCode, 201);
  assert.deepEqual(Object.keys(ok.json()).sort(), ['email', 'id', 'name', 'role']);
  assert.equal((await a.inject({ method: 'POST', url: '/register', payload: p })).statusCode, 409);
});

test('club-event: alanlar tiplere uygun, 404', async () => {
  const e = event();
  const list = (await e.inject('/events')).json();
  assert.equal(list.length, 3);
  assert.equal(typeof list[0].startTime, 'string');
  assert.equal(typeof list[0].capacity, 'number');
  assert.equal((await e.inject('/events/999')).statusCode, 404);
  const created = await e.inject({ method: 'POST', url: '/events', payload: { clubId: 1, title: 'T', description: 'D', startTime: '2026-12-01T10:00:00Z', capacity: 5 } });
  assert.equal(created.statusCode, 201);
});

test('registration: token yok 401', async () => {
  const r = reg();
  assert.equal((await r.inject({ method: 'POST', url: '/registrations', payload: { userId: 1, eventId: 1 } })).statusCode, 401);
});

test('registration: kayıt, çift kayıt, kontenjan dolu, iptal', async () => {
  const r = reg();
  const h = { authorization: `Bearer ${signToken({ sub: 1 })}` };
  const post = (eventId) => r.inject({ method: 'POST', url: '/registrations', headers: h, payload: { userId: 1, eventId } });
  const first = await post(2);
  assert.equal(first.statusCode, 201);
  assert.equal(first.json().status, 'REGISTERED');
  assert.equal((await post(2)).json().error, 'ALREADY_REGISTERED');
  assert.equal((await post(3)).json().error, 'EVENT_FULL');
  const cancel = await r.inject({ method: 'DELETE', url: `/registrations/${first.json().registrationId}`, headers: h });
  assert.equal(cancel.json().status, 'CANCELLED');
  assert.equal((await r.inject({ method: 'GET', url: '/registrations/me', headers: h })).json().length, 1);
});

test('hata bayrağı: ?fail=503 ve /health etkilenmez', async () => {
  const e = event();
  const f = await e.inject('/events?fail=503');
  assert.equal(f.statusCode, 503);
  assert.deepEqual(Object.keys(f.json()).sort(), ['error', 'message']);
  const h = await e.inject('/health?fail=500');
  assert.equal(h.statusCode, 200);
  assert.deepEqual(Object.keys(h.json()).sort(), ['service', 'status', 'version']);
});

test('live ws: bağlanınca LiveEventMessage akar, stop ile durur', async () => {
  const s = live({ rate: 50 });
  await new Promise((r) => s.listen(0, r));
  const ws = new WebSocket(`ws://localhost:${s.address().port}/live`);
  const msgs = [];
  ws.on('message', (m) => msgs.push(JSON.parse(m)));
  await new Promise((r) => ws.on('open', r));
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(msgs.length >= 5);
  assert.deepEqual(Object.keys(msgs[0]).sort(), ['action', 'eventId', 'timestamp', 'userId']);
  assert.ok(['VIEW', 'CLICK', 'REGISTER', 'CANCEL'].includes(msgs[0].action));
  ws.send(JSON.stringify({ type: 'stop' }));
  await new Promise((r) => setTimeout(r, 100));
  const n = msgs.length;
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(msgs.length, n);
  ws.close(); s.close();
});
