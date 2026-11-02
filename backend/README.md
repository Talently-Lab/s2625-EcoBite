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

## Datos de prueba

La seed crea roles, tres restaurantes y, si están configuradas
ADMIN_EMAIL y ADMIN_PASSWORD, un administrador inicial.

Para incluir cuentas y platos demo, configura en backend/.env:

```dotenv
SEED_DEMO=true
SEED_DEMO_PASSWORD=
```

Completa la contraseña con al menos 15 caracteres y máximo 72 bytes.
No subas el archivo .env al repositorio.

Desde backend, ejecuta:

```bash
npx prisma db seed
```

### Cuentas demo

| Email | Rol | Restaurante |
|---|---|---|
| cliente1@demo.ecobite.test | cliente | — |
| cliente2@demo.ecobite.test | cliente | — |
| gerente.verde@demo.ecobite.test | gerente_restaurante | Verde Vivo |
| gerente.raiz@demo.ecobite.test | gerente_restaurante | Raiz Organica |
| delivery1@demo.ecobite.test | delivery | Ambos restaurantes |
| delivery2@demo.ecobite.test | delivery | Ambos restaurantes |

Las cuentas demo nuevas usan la contraseña definida en
SEED_DEMO_PASSWORD. El administrador usa ADMIN_PASSWORD.

Se crean dos perfiles delivery con bicicleta, cuatro asociaciones
con restaurantes y cinco platos: cuatro activos y uno inactivo.
Las imágenes iniciales quedan en null.

Repetir la seed conserva los registros existentes y no restablece
sus contraseñas. No crea pedidos ni envíos.

Estos datos son para desarrollo y pruebas. Cada integrante debe
ejecutar la seed en su propia base de datos.