# Mock Servisler

Kurulum: `npm install`
Hepsini çalıştır: `npm run all`  (tek tek: `npm run auth|club-event|registration|live-ws`)
Test: `npm test`

| Servis | Port | Uç noktalar |
|---|---|---|
| Auth | 4001 | POST /register, POST /login, GET /me |
| Event | 4002 | GET /clubs, /clubs/:id, /events, /events/:id |
| Registration | 4003 | POST /registrations, GET /registrations/me, DELETE /registrations/:id |
| Live (WS) | 4004 | ws://localhost:4004/live |

Test kullanıcısı: `test@campus.edu` / `123456`. JWT sırrı: `JWT_SECRET` (varsayılan `campushub-dev-secret`, gateway ile aynı olmalı).

**Hata simülasyonu:** `SIMULATE_ERROR=500|503|down|timeout` ortam değişkeni veya istek başına `?fail=503`. `/health` etkilenmez.

**WebSocket:** bağlanınca `{type:"hello"}` gelir. İstemci `{type:"start"}` / `{type:"stop"}` yollar. Olay: `{type:"event", data:{id, kind, value, timestamp}}`. Hız: `EVENTS_PER_SECOND` (varsayılan 5).
