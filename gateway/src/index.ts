import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import { registerGatewayRoutes } from './routes/gatewayRoutes';
import { HealthResponse } from '../../shared/types';

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: config.jwtSecret });

  app.get('/health', async (): Promise<HealthResponse> => {
    return {
      service: 'api-gateway',
      status: 'UP',
      version: '1.0.0',
    };
  });

  await registerGatewayRoutes(app);

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`API Gateway http://localhost:${config.port} adresinde çalışıyor.`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
