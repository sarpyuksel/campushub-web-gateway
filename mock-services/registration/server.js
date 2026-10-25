import { pathToFileURL } from 'node:url';
import { createApp, start, getUser } from '../shared/common.js';
import { events, initialRegistered } from '../shared/seed.js';

export function build() {
  const app = createApp('registration-service');
  const counts = { ...initialRegistered }; // etkinlik id -> kayıtlı sayısı
  const registrations = []; // RegistrationResponse[]

  const unauthorized = (reply) => reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Geçersiz veya eksik token' });

  // POST /registrations { userId, eventId } -> RegistrationResponse
  app.post('/registrations', async (req, reply) => {
    if (!getUser(req)) return unauthorized(reply);
    const userId = Number(req.body?.userId);
    const eventId = Number(req.body?.eventId);
    if (!userId || !eventId) return reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'userId ve eventId gerekli' });
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return reply.code(404).send({ error: 'EVENT_NOT_FOUND', message: 'Etkinlik bulunamadı' });
    if (registrations.some((r) => r.userId === userId && r.eventId === eventId && r.status === 'REGISTERED'))
      return reply.code(409).send({ error: 'ALREADY_REGISTERED', message: 'Bu etkinliğe zaten kayıtlısın' });
    if ((counts[eventId] ?? 0) >= ev.capacity)
      return reply.code(409).send({ error: 'EVENT_FULL', message: 'Etkinlik kontenjanı dolu' });
    counts[eventId] = (counts[eventId] ?? 0) + 1;
    const reg = { registrationId: registrations.length + 1, userId, eventId, status: 'REGISTERED' };
    registrations.push(reg);
    return reply.code(201).send(reg);
  });

  // GET /registrations?userId=1  veya  GET /registrations/me  -> RegistrationResponse[]
  app.get('/registrations', async (req, reply) => {
    if (!getUser(req)) return unauthorized(reply);
    const { userId, eventId } = req.query;
    return registrations.filter((r) => (!userId || r.userId === Number(userId)) && (!eventId || r.eventId === Number(eventId)));
  });
  app.get('/registrations/me', async (req, reply) => {
    const p = getUser(req);
    if (!p) return unauthorized(reply);
    return registrations.filter((r) => r.userId === p.sub);
  });

  // DELETE /registrations/:id -> RegistrationResponse (status: CANCELLED)
  app.delete('/registrations/:id', async (req, reply) => {
    if (!getUser(req)) return unauthorized(reply);
    const reg = registrations.find((r) => r.registrationId === Number(req.params.id));
    if (!reg) return reply.code(404).send({ error: 'REGISTRATION_NOT_FOUND', message: 'Kayıt bulunamadı' });
    if (reg.status === 'REGISTERED') { reg.status = 'CANCELLED'; counts[reg.eventId]--; }
    return reg;
  });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4003);
