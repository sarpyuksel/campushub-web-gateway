# Mock Servisler

- Kurulum: `npm install`
- Hepsini çalıştır: `npm run all` (tek tek: `npm run auth`, `club-event`, `registration`, `live-ws`)
- Test: `npm test`

Yanıt biçimleri `shared/types/index.ts` ile uyumludur.

| Servis | Port | Uç noktalar |
|---|---|---|
| Auth | 4001 | POST /register, POST /login, GET /me, GET /users/:id |
| Club/Event | 4002 | GET /clubs, GET /clubs/:id, POST /clubs, GET /events, GET /events/:id, POST /events |
| Registration | 4003 | POST /registrations, GET /registrations, GET /registrations/me, DELETE /registrations/:id |
| Live (WS) | 4004 | ws://localhost:4004/live |

Her serviste `GET /health` vardır.

Test kullanıcısı: `test@campus.edu` / `123456` (userId 1). JWT sırrı: `JWT_SECRET` (varsayılan `campushub-dev-secret`, gateway ile aynı olmalı). Korumalı uç noktalar `Authorization: Bearer <token>` ister.

Hazır veri: etkinlik 3 (Foto Yürüyüşü) başta doludur, kayıt olunca `EVENT_FULL` (409) döner. Aynı etkinliğe ikinci kayıt `ALREADY_REGISTERED` (409) döner.

**Hata simülasyonu:** `SIMULATE_ERROR=500|503|down|timeout` ortam değişkeni veya istek başına `?fail=503`. `/health` etkilenmez. Hata gövdesi `{ error, message }`.

**WebSocket:** Bağlanınca `LiveEventMessage` akmaya başlar: `{ timestamp, userId, eventId, action }`. İsteğe bağlı olarak istemci `{"type":"stop"}` / `{"type":"start"}` gönderebilir. Hız: `EVENTS_PER_SECOND` (varsayılan 5). Bağlanınca akışın başlamaması için `STREAM_ON_CONNECT=0`.
