# EcoBite - Backend

API en Node.js + Express + Prisma + PostgreSQL.

## Requisitos
- Docker y Docker Compose

## Configuración
1. Copia el archivo de ejemplo:
```bash
   cp backend/.env.example backend/.env
```
2. Genera un secreto para JWT:
```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
3. Pega el resultado en `backend/.env` como `JWT_SECRET=...`
   (nunca subas el `.env` a Git ni lo compartas por chat).

## Levantar el proyecto
```bash
docker compose up --build -d
```
Verifica que funciona: http://localhost:3000/api/health

## Documentación de la API
Ver [docs/api/endpoints.md](../docs/api/endpoints.md).