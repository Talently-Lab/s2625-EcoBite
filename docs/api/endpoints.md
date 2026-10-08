# API EcoBite - Endpoints

**Última actualización:** 2026-10-07
**Responsable:** Brandon (Backend)

Base URL (local): `http://localhost:3000/api`

## Convenciones

- Peticiones y respuestas en JSON (`Content-Type: application/json`).
- Los errores siempre tienen esta forma: `{ "error": "mensaje" }`
- Las rutas protegidas requieren el header `Authorization: Bearer <token>`.
- El token se obtiene en el login, dura 2 horas y no hay refresh. Al expirar, el front debe mandar al usuario a login.

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos faltantes, mal formados o que no cumplen las reglas |
| 401 | Sin token, token inválido/expirado o credenciales incorrectas |
| 404 | Ruta inexistente |
| 409 | El registro ya existe (por ejemplo, email duplicado) |
| 500 | Error interno del servidor |

---

## Autenticación

### POST /auth/login

Body:
```json
{ "email": "ana@test.com", "contrasena": "123456" }
```

Respuesta 200:
```json
{
  "token": "eyJ...",
  "usuario": {
    "id": "uuid",
    "nombre": "Ana Prueba",
    "email": "ana@test.com",
    "tipoUsuario": { "id": "uuid", "nombreRol": "cliente", "nivelAcceso": "propio" }
  }
}
```

Errores:
- 400: faltan datos o no son texto.
- 401: "Credenciales inválidas" (mismo mensaje si el email no existe o la contraseña es incorrecta).

---

## Usuarios

### POST /usuarios/registrar

Body:
```json
{ "nombre": "Ana Prueba", "email": "ana@test.com", "contrasena": "123456" }
```

Reglas:
- `nombre`: obligatorio.
- `email`: con formato válido (`usuario@dominio.ext`). Se guarda en minúsculas.
- `contrasena`: obligatoria, de tipo texto. Aún sin reglas de complejidad.
- El rol se asigna automáticamente como `cliente`. No se envía en el body.

Respuesta 201:
```json
{
  "message": "Usuario registrado con exito",
  "usuario": {
    "id": "uuid",
    "email": "ana@test.com",
    "nombre": "Ana Prueba",
    "tipoUsuario": { "id": "uuid", "nombreRol": "cliente", "nivelAcceso": "propio" }
  }
}
```

El registro **no devuelve token**: después de registrarse, el usuario debe hacer login.

Errores:
- 400: validación (el mensaje indica qué regla falla).
- 409: el email ya está registrado.

### GET /usuarios/perfil (requiere token)

Respuesta 200:
```json
{
  "usuario": {
    "id": "uuid",
    "email": "ana@test.com",
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
