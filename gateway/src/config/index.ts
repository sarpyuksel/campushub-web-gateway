import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 8080,
  jwtSecret: process.env.JWT_SECRET || 'campushub-super-secret-key',
  services: {
    auth: process.env.AUTH_URL || 'http://localhost:8001',
    clubEvent: process.env.EVENT_URL || 'http://localhost:8002',
    registration: process.env.REGISTRATION_URL || 'http://localhost:8003',
    ai: process.env.AI_URL || 'http://localhost:8004',
    liveData: process.env.LIVE_DATA_URL || 'http://localhost:8005',
  }
};
