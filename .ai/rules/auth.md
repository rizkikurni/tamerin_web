---
paths:
  - 'app/Http/Requests/Auth/*.php'
---

# Auth

## Pertahankan dua lapis proteksi autentikasi publik

Login dan registrasi harus tetap dilindungi rate limiter. Saat `services.turnstile.enabled` aktif, token Cloudflare Turnstile wajib diverifikasi server-side dengan action yang sesuai (`login`/`register`) dan hostname yang diizinkan; jangan hanya mengandalkan widget frontend.
