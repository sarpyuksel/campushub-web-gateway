import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET tanımlı değil. .env.example dosyasını gateway/.env olarak kopyalayın.');
}

export const config = {
  port: Number(process.env.PORT) || 8000,
  jwtSecret,
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 5000,
  services: {
    auth: process.env.AUTH_URL || 'http://localhost:4001',
    clubEvent: process.env.EVENT_URL || 'http://localhost:4002',
    registration: process.env.REGISTRATION_URL || 'http://localhost:4003',
    ai: process.env.AI_URL || 'http://localhost:4005',
    liveData: process.env.LIVE_DATA_URL || 'http://localhost:4004',
  },
};
