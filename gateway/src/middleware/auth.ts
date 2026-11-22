import '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Geçersiz veya eksik JWT token.',
    });
  }
}
