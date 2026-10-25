// NOT: Alan adları PDF'teki JSON formatına göre güncellenmeli (tek yer burası).
export const users = [
  { id: 'u1', name: 'Test Kullanıcı', email: 'test@campus.edu', password: '123456' },
];

export const clubs = [
  { id: 'c1', name: 'Yazılım Kulübü', description: 'Kodlama ve projeler' },
  { id: 'c2', name: 'Müzik Kulübü', description: 'Konser ve atölyeler' },
  { id: 'c3', name: 'Fotoğraf Kulübü', description: 'Gezi ve çekim günleri' },
];

export const events = [
  { id: 'e1', clubId: 'c1', title: 'Hackathon', date: '2026-11-10T10:00:00Z', location: 'Lab 1', capacity: 30, registered: 28 },
  { id: 'e2', clubId: 'c2', title: 'Açık Mikrofon', date: '2026-11-12T18:00:00Z', location: 'Amfi', capacity: 100, registered: 40 },
  { id: 'e3', clubId: 'c3', title: 'Foto Yürüyüşü', date: '2026-11-15T09:00:00Z', location: 'Kampüs Girişi', capacity: 2, registered: 2 },
];
