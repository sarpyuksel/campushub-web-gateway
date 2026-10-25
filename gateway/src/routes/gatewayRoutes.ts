import { FastifyInstance } from 'fastify';
import { config } from '../config';
import { forwardRequest } from '../clients/httpClient';
import { verifyJwt } from '../middleware/auth';

export async function registerGatewayRoutes(app: FastifyInstance) {
  // Auth Rotaları -> Grup 2
  app.post('/api/auth/register', async (req, reply) => {
    const res = await forwardRequest(config.services.auth, '/auth/register', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/auth/login', async (req, reply) => {
    const res = await forwardRequest(config.services.auth, '/auth/login', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  // Kulüp Rotaları -> Grup 3
  app.get('/api/clubs', async (_req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/clubs', 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/clubs', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/clubs', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  // Etkinlik Rotaları -> Grup 3
  app.get('/api/events', async (_req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/events', 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.get<{ Params: { id: string } }>('/api/events/:id', async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, `/events/${req.params.id}`, 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/events', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/events', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  // Etkinlik Kayıt Rotaları -> Grup 4
  app.post('/api/registrations', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.registration, '/registrations', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });
}
