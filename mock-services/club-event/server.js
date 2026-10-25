import { pathToFileURL } from 'node:url';
import { createApp, start } from '../shared/common.js';
import { clubs as seedClubs, events as seedEvents } from '../shared/seed.js';

export function build() {
  const app = createApp('club-event-service');
  const clubs = seedClubs.map((c) => ({ ...c }));
  const events = seedEvents.map((e) => ({ ...e }));
  const notFound = (reply, what) => reply.code(404).send({ error: `${what}_NOT_FOUND`, message: `${what === 'CLUB' ? 'Kulüp' : 'Etkinlik'} bulunamadı` });

  app.get('/clubs', async () => clubs);
  app.get('/clubs/:id', async (req, reply) => clubs.find((c) => c.id === Number(req.params.id)) || notFound(reply, 'CLUB'));

  // POST /clubs { name, description } -> Club
  app.post('/clubs', async (req, reply) => {
    const { name, description } = req.body || {};
    if (!name || !description) return reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'name ve description gerekli' });
    const club = { id: clubs.length + 1, name, description };
    clubs.push(club);
    return reply.code(201).send(club);
  });

  app.get('/events', async (req) => (req.query.clubId ? events.filter((e) => e.clubId === Number(req.query.clubId)) : events));
  app.get('/events/:id', async (req, reply) => events.find((e) => e.id === Number(req.params.id)) || notFound(reply, 'EVENT'));

  // POST /events { clubId, title, description, startTime, capacity } -> CampusEvent
  app.post('/events', async (req, reply) => {
    const { clubId, title, description, startTime, capacity } = req.body || {};
    if (!clubId || !title || !description || !startTime || !capacity) return reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'clubId, title, description, startTime, capacity gerekli' });
    if (!clubs.some((c) => c.id === Number(clubId))) return notFound(reply, 'CLUB');
    const ev = { id: events.length + 1, clubId: Number(clubId), title, description, startTime, capacity: Number(capacity), category: 'OTHER' };
    events.push(ev);
    return reply.code(201).send(ev);
  });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4002);
