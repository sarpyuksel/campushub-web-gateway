import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import { registerGatewayRoutes } from './routes/gatewayRoutes';
import { HealthResponse } from '../../shared/types';

async function start() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: config.jwtSecret });

  app.get('/health', async (): Promise<HealthResponse> => {
    return {
      status: 'UP',
      service: 'api-gateway',
      version: '1.0.0',
    };
  });

  await registerGatewayRoutes(app);

  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`Gateway ayakta: http://localhost:${config.port}/health`);
}

start().catch((err) => {
  console.error('Gateway başlatılamadı:', err);
  process.exit(1);
});
