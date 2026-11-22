import { FastifyInstance, FastifyRequest } from 'fastify';
import { config } from '../config';
import { forwardRequest } from '../clients/httpClient';
import { verifyJwt } from '../middleware/auth';

function getAuthHeaders(req: FastifyRequest): Record<string, string> {
  const auth = req.headers.authorization;
  return auth ? { Authorization: auth } : {};
}

export async function registerGatewayRoutes(app: FastifyInstance) {
  // Auth Rotalari (mock-services/auth -> /register, /login, /me, /users/:id)
  app.post('/api/auth/register', async (req, reply) => {
    const res = await forwardRequest(config.services.auth, '/register', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/auth/login', async (req, reply) => {
    const res = await forwardRequest(config.services.auth, '/login', 'POST', req.body);
    return reply.status(res.status).send(res.data);
  });

  app.get('/api/auth/me', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.auth, '/me', 'GET', undefined, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  app.get<{ Params: { id: string } }>('/api/auth/users/:id', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.auth, `/users/${req.params.id}`, 'GET', undefined, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  // Kulup Rotalari
  app.get('/api/clubs', async (_req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/clubs', 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.get<{ Params: { id: string } }>('/api/clubs/:id', async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, `/clubs/${req.params.id}`, 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/clubs', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/clubs', 'POST', req.body, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  // Etkinlik Rotalari
  app.get<{ Querystring: { clubId?: string } }>('/api/events', async (req, reply) => {
    const query = req.query.clubId ? `?clubId=${encodeURIComponent(req.query.clubId)}` : '';
    const res = await forwardRequest(config.services.clubEvent, `/events${query}`, 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.get<{ Params: { id: string } }>('/api/events/:id', async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, `/events/${req.params.id}`, 'GET');
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/events', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.clubEvent, '/events', 'POST', req.body, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  // Etkinlik Kayit Rotalari
  app.get<{ Querystring: { userId?: string } }>('/api/registrations', { preHandler: [verifyJwt] }, async (req, reply) => {
    const query = req.query.userId ? `?userId=${encodeURIComponent(req.query.userId)}` : '';
    const res = await forwardRequest(config.services.registration, `/registrations${query}`, 'GET', undefined, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  app.get('/api/registrations/me', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.registration, '/registrations/me', 'GET', undefined, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  app.post('/api/registrations', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.registration, '/registrations', 'POST', req.body, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  app.delete<{ Params: { id: string } }>('/api/registrations/:id', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.registration, `/registrations/${req.params.id}`, 'DELETE', undefined, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });

  // Canli Akis Baslatma
  app.post('/api/stream/start', { preHandler: [verifyJwt] }, async (req, reply) => {
    const res = await forwardRequest(config.services.liveData, '/stream/start', 'POST', req.body, getAuthHeaders(req));
    return reply.status(res.status).send(res.data);
  });
}
