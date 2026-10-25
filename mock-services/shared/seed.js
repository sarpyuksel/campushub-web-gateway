// Alan adları shared/types/index.ts ile birebir aynıdır.
export const users = [
  { id: 1, name: 'Test Kullanıcı', email: 'test@campus.edu', password: '123456', role: 'STUDENT' },
];

export const clubs = [
  { id: 1, name: 'Yazılım Kulübü', description: 'Kodlama ve projeler' },
  { id: 2, name: 'Müzik Kulübü', description: 'Konser ve atölyeler' },
  { id: 3, name: 'Fotoğraf Kulübü', description: 'Gezi ve çekim günleri' },
];

export const events = [
  { id: 1, clubId: 1, title: 'Hackathon', description: '24 saatlik yazılım yarışması', startTime: '2026-11-10T10:00:00Z', capacity: 30, category: 'TECHNOLOGY' },
  { id: 2, clubId: 2, title: 'Açık Mikrofon', description: 'Sahne herkese açık', startTime: '2026-11-12T18:00:00Z', capacity: 100, category: 'ART' },
  { id: 3, clubId: 3, title: 'Foto Yürüyüşü', description: 'Kampüste çekim günü', startTime: '2026-11-15T09:00:00Z', capacity: 2, category: 'SOCIAL' },
];

// Registration mock'u başlangıçta kaç kişi kayıtlı sayılsın (etkinlik id -> sayı).
// Etkinlik 3 başta dolu: "kontenjan dolu" senaryosunu denemek için.
export const initialRegistered = { 1: 28, 2: 40, 3: 2 };
