# 360 Agro — Contexto del Proyecto

## Stack
- Frontend: React 19 + Vite + Tailwind CSS + Manrope
- Backend: Node/Express + MongoDB + JWT
- Extras: Socket.IO + Gemini AI + MercadoPago + Resend + Cloudinary

## URLs de Producción
- Frontend: https://360agro.vercel.app
- Backend: https://responsible-adventure-production-c068.up.railway.app

## Paleta de Colores
- Fondo: #F8FAF8
- Primary: #235347
- Acento: #8CB79B
- Texto: #1A2E28
- Cards: blanco con shadow-md hover:shadow-xl

## Reglas de Trabajo
- Prompts con estructura: Objetivo → Contexto → Restricción
- Solo fragmentos relevantes, nunca reescribir archivos completos
- Reiniciar chat cuando sea muy largo
- No subir credenciales al repositorio

## Variables de Entorno
### Backend (Railway)
MONGO_URI, JWT_SECRET, PORT, GEMINI_API_KEY, MP_PUBLIC_KEY,
MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, RESEND_API_KEY,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
FRONTEND_URL, WEBHOOK_URL

### Frontend (Vercel)
VITE_API_URL, VITE_FINANCE_URL

## Estructura
360agro/
├── frontend/
└── backend/
