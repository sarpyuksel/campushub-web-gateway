// 1. Ortak Hata ve Health Formatı (Madde 24 & 25)
export interface HealthResponse {
  service: string;
  status: 'UP' | 'DOWN';
  version: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

// 2. Grup 2 - Auth Service Tipleri (Madde 8)
export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role?: 'STUDENT' | 'CLUB_ADMIN' | 'SYSTEM_ADMIN';
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
}

// 3. Grup 3 - Club & Event Service Tipleri (Madde 9 & 10)
export interface CreateClubRequest {
  name: string;
  description: string;
}

export interface Club {
  id: number;
  name: string;
  description?: string;
}

export interface CreateEventRequest {
  clubId: number;
  title: string;
  description: string;
  startTime: string;
  capacity: number;
}

export interface CampusEvent {
  id: number;
  clubId: number;
  title: string;
  description?: string;
  startTime?: string;
  capacity: number;
  category?: EventCategory;
}

// 4. Grup 4 - Registration Service Tipleri (Madde 11)
export interface CreateRegistrationRequest {
  userId: number;
  eventId: number;
}

export interface RegistrationResponse {
  registrationId: number;
  userId: number;
  eventId: number;
  status: 'REGISTERED' | 'CANCELLED';
}

// 5. Grup 5 - AI Service Tipleri (Madde 13 & 14)
export type EventCategory = 'TECHNOLOGY' | 'SPORT' | 'ART' | 'CAREER' | 'SOCIAL' | 'OTHER';

export interface ClassifyRequest {
  text: string;
}

export interface ClassifyResponse {
  category: EventCategory;
  confidence: number;
}

// 6. Grup 6 - Live Data Service Tipleri (Madde 16 & 18)
export type LiveActionType = 'VIEW' | 'CLICK' | 'REGISTER' | 'CANCEL';

export interface LiveEventMessage {
  timestamp: string;
  userId: number;
  eventId: number;
  action: LiveActionType;
}
