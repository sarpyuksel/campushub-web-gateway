import { pathToFileURL } from 'node:url';
import { createApp, start } from '../shared/common.js';
import { clubs, events as seed } from '../shared/seed.js';

export function build() {
  const app = createApp('event-mock');
  const events = seed.map((e) => ({ ...e }));

  app.get('/clubs', async () => clubs);
  app.get('/clubs/:id', async (req, reply) => clubs.find((c) => c.id === req.params.id) || reply.code(404).send({ error: 'not_found', message: 'Kulüp bulunamadı' }));
  app.get('/events', async (req) => (req.query.clubId ? events.filter((e) => e.clubId === req.query.clubId) : events));
  app.get('/events/:id', async (req, reply) => events.find((e) => e.id === req.params.id) || reply.code(404).send({ error: 'not_found', message: 'Etkinlik bulunamadı' }));
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4002);
