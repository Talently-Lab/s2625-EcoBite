# API EcoBite - Endpoints

**Última actualización:** 2026-10-07
**Responsable:** Brandon (Backend)

Base URL (local): `http://localhost:3000/api`

## Convenciones

- Peticiones y respuestas en JSON (`Content-Type: application/json`).
- Los errores siempre tienen esta forma: `{ "error": "mensaje" }`
- Las rutas protegidas requieren el header `Authorization: Bearer <token>`.
- El token se obtiene en el login, dura 2 horas y no hay refresh. Al expirar, el front debe mandar al usuario a login.
- El body JSON tiene un límite de 100 KB.
- Los límites de login y registro usan contadores independientes.
- Todas las peticiones que alcanzan cada limitador cuentan,
  incluidas las fallidas.
- Los contadores están en memoria y se reinician con la API.
  Varias instancias requieren un almacenamiento compartido.

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos faltantes, mal formados o que no cumplen las reglas |
| 401 | Sin token, token inválido/expirado o credenciales incorrectas |
| 404 | Ruta inexistente |
| 409 | El registro ya existe (por ejemplo, email duplicado) |
| 413 | El cuerpo supera el límite de 100 KB |
| 429 | Se excedió el límite de peticiones |
| 500 | Error interno del servidor |

---

## Autenticación

### POST /auth/login

Body:
```json
{ "email": "ana.prueba@gmail.com", "contrasena": "PruebaSegura2026!" }
```

Respuesta 200:
```json
{
  "token": "eyJ...",
  "usuario": {
    "id": "uuid",
    "nombre": "Ana Prueba",
    "email": "ana.prueba@gmail.com",
    "tipoUsuario": { "id": "uuid", "nombreRol": "cliente", "nivelAcceso": "propio" }
  }
}
```
Reglas:
- El body debe ser un objeto JSON con email y contraseña.
- El email se normaliza eliminando espacios externos y usando minúsculas.
- Una contraseña mayor a 72 bytes devuelve 401.
- El mínimo de 15 caracteres se exige al registrar nuevas cuentas;
  no se aplica al login de cuentas existentes.
- Límite: 20 peticiones por IP cada 15 minutos.

Errores:
- 400: faltan datos o no son texto.
- 401: "Credenciales inválidas" (mismo mensaje si el email no existe o la contraseña es incorrecta).
- 413: body demasiado grande.
- 429: límite de peticiones excedido.

---

## Usuarios

### POST /usuarios/registrar

Body:
```json
{ "nombre": "Ana Prueba", "email": "ana.prueba@gmail.com", "contrasena": "PruebaSegura2026!" }
```

Reglas:
- El body debe ser un objeto JSON.
- `nombre`, `email` y `contrasena` son obligatorios y deben ser texto.
- `nombre`: no puede contener solo espacios; máximo 200 caracteres
  después de normalizar. Se eliminan espacios externos, se agrupan
  espacios repetidos y se capitaliza cada palabra.
- `email`: máximo 200 caracteres, formato válido y dominio
  `gmail.com`, `outlook.com` o `hotmail.com`.
  Se eliminan espacios externos y se guarda en minúsculas.
- `contrasena`: mínimo 15 caracteres y máximo 72 bytes en UTF-8.
  No puede contener solo espacios. No se recorta ni modifica.
- El rol se asigna automáticamente como `cliente`.
  Los campos adicionales enviados no se utilizan.
- Límite: 10 peticiones por IP cada 15 minutos.

Respuesta 201:
```json
{
  "message": "Usuario registrado con exito",
  "usuario": {
    "id": "uuid",
    "email": "ana.prueba@gmail.com",
    "nombre": "Ana Prueba",
    "tipoUsuario": { "id": "uuid", "nombreRol": "cliente", "nivelAcceso": "propio" }
  }
}
```

El registro **no devuelve token**: después de registrarse, el usuario debe hacer login.

Errores:
- 400: validación (el mensaje indica qué regla falla).
- 409: el email ya está registrado.
- 413: body demasiado grande.
- 429: límite de peticiones excedido.

### GET /usuarios/perfil (requiere token)

Respuesta 200:
```json
{
  "usuario": {
    "id": "uuid",
    "email": "ana.prueba@gmail.com",
    "tipoUsuarioId": "uuid",
    "iat": 1791419584,
    "exp": 1791426784
  }
}
```

Errores: 401 (sin token, token inválido o expirado).

---

## Restaurantes

### GET /restaurantes

```json

[
    {
        "id": "7be4dd88-9bff-4994-b985-073256525740",
        "nombre": "Raiz Organica",
        "imagenUrl": null,
        "domicilio": "Calle Durango 45, CDMX",
        "latitude": "19.4194",
        "longitude": "-99.1627"
    },
    {
        "id": "0a997190-9a20-4c4f-82e8-4122bf55c02b",
        "nombre": "Verde Vivo",
        "imagenUrl": null,
        "domicilio": "Av. Insurgentes Sur 100, CDMX",
        "latitude": "19.4326",
        "longitude": "-99.1332"
    }
]
```
---

## Salud

### GET /health

Respuesta 200: `{ "status": "ok" }`
