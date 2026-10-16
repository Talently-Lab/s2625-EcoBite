# API EcoBite - Endpoints

**Última actualización:** 2026-10-16
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
| 403 | Cuenta desactivada o permisos insuficientes |
| 413 | El cuerpo supera el tamaño permitido |
| 415 | Content-Type no admitido |
| 429 | Límite de peticiones excedido |
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
{
  "nombre": "Ana Prueba",
  "email": "ana.prueba@gmail.com",
  "contrasena": "Prueba2026!",
  "session_id": "d346a28f-c316-471e-b9bc-c468b39593c7"
}
```

Reglas:
- `nombre`: obligatorio. Se guarda con la primera letra de cada palabra en mayúscula y el resto en minúscula.
- `email`: con formato válido y dominio `gmail.com`, `outlook.com` o `hotmail.com`. Se guarda en minúsculas.
- El rol se asigna automáticamente como `cliente`. No se envía en el body.


Tracking:
- `session_id` es opcional y debe ser un UUID v4.
- Frontend envía la misma sesión utilizada en los eventos del formulario.
- Cuando se crea la cuenta, el backend genera `click_boton_crear_cuenta`
  con el usuario creado y el perfil `cliente`.
- Frontend no debe enviar ese evento a `/eventos`.
- Si falta `session_id`, es inválido o falla el tracking, la cuenta
  se crea igualmente; no se garantiza que se guarde la conversión.
- Un registro fallido no genera el evento.
- El tracking se ejecuta sin esperar su resultado para responder.
  Si el proceso se detiene antes del guardado, el evento puede perderse.

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


---

## Tracking del registro

### POST /eventos

Recibe eventos del formulario y los guarda en `analytics.eventos`.

Autenticación opcional:
- Sin Authorization: guarda `usuario_id` como NULL.
- Con Bearer Token válido: obtiene el usuario desde la base de datos.
- Un token inválido o expirado devuelve 401.
- Una cuenta desactivada devuelve 403.
- `rol_usuario` representa el perfil de la pantalla; no concede permisos.

Body:
```json
{
  "id": "4bb18da2-2f70-4c12-9c76-e85bcd271a90",
  "nombre_evento": "visita_pagina_registro",
  "rol_usuario": "cliente",
  "session_id": "d346a28f-c316-471e-b9bc-c468b39593c7",
  "fecha_cliente": "2026-10-16T05:20:00.000Z",
  "propiedades": {}
}
```

| Campo | Regla |
|---|---|
| `id` | UUID v4 obligatorio, generado por frontend para cada evento |
| `nombre_evento` | `visita_pagina_registro` o `click_campo_email` |
| `rol_usuario` | `cliente`, `gerente_restaurante`, `admin` o `delivery` |
| `session_id` | UUID v4 obligatorio, compartido durante la sesión de navegación |
| `fecha_cliente` | Fecha ISO 8601 con zona horaria explícita |
| `propiedades` | Objeto JSON opcional; por defecto `{}` |

Reglas de integración:
- Generar los UUID con `crypto.randomUUID()`.
- Conservar el mismo `id` al reintentar un evento.
- Usar un nuevo `id` para una interacción nueva.
- Mantener `session_id` entre los eventos y la petición de registro.
- No enviar `usuario_id` ni `fecha_recepcion`: los completa el backend.
- Los campos adicionales en el nivel principal del body se rechazan.
- `propiedades` admite claves libres actualmente. No enviar contraseñas,
  tokens ni datos personales del formulario.
- `click_boton_crear_cuenta` se genera exclusivamente desde el backend;
  enviarlo a este endpoint devuelve 400.
- Los perfiles analíticos permitidos no habilitan registros públicos
  para esos roles. El registro actual crea únicamente clientes.

Fechas:
- `fecha_cliente` conserva la fecha enviada por frontend.
- No se rechazan fechas por antigüedad o desfase del reloj.
- `fecha_recepcion` se asigna en la base de datos y es la referencia
  de recepción del servidor.
- En el evento interno de cuenta creada, `fecha_cliente` corresponde
  a la hora del backend.

Respuesta 202:
```json
{
  "message": "Evento aceptado"
}
```

Deduplicación:
- La tabla utiliza `id UUID PRIMARY KEY`.
- Reenviar un ID existente devuelve 202 sin insertar otra fila.
- El evento existente no se modifica, aunque cambie el body o el token.
- La deduplicación por ID no impide eventos ficticios con IDs diferentes.

Límites actuales:
- Body máximo: 8 KB.
- Hasta 30 peticiones por minuto por IP.
- Las peticiones rechazadas también consumen el límite.
- Los contadores se mantienen en memoria y se reinician con la API.
- Varias instancias requieren un almacenamiento compartido.
- Antes de desplegar detrás de un proxy, revisar la configuración
  de la IP del cliente.

| Código | Motivo |
|---|---|
| 400 | Datos inválidos, campos adicionales o evento no permitido |
| 401 | Token inválido, expirado o usuario inexistente |
| 403 | Cuenta desactivada |
| 413 | Body mayor a 8 KB |
| 415 | Content-Type distinto de `application/json` |
| 429 | Límite de peticiones excedido |
| 500 | Error interno al guardar el evento público |---

## Tracking del registro

### POST /eventos

Recibe eventos del formulario y los guarda en `analytics.eventos`.

Autenticación opcional:
- Sin Authorization: guarda `usuario_id` como NULL.
- Con Bearer Token válido: obtiene el usuario desde la base de datos.
- Un token inválido o expirado devuelve 401.
- Una cuenta desactivada devuelve 403.
- `rol_usuario` representa el perfil de la pantalla; no concede permisos.

Body:
```json
{
  "id": "4bb18da2-2f70-4c12-9c76-e85bcd271a90",
  "nombre_evento": "visita_pagina_registro",
  "rol_usuario": "cliente",
  "session_id": "d346a28f-c316-471e-b9bc-c468b39593c7",
  "fecha_cliente": "2026-10-16T05:20:00.000Z",
  "propiedades": {}
}
```

| Campo | Regla |
|---|---|
| `id` | UUID v4 obligatorio, generado por frontend para cada evento |
| `nombre_evento` | `visita_pagina_registro` o `click_campo_email` |
| `rol_usuario` | `cliente`, `gerente_restaurante`, `admin` o `delivery` |
| `session_id` | UUID v4 obligatorio, compartido durante la sesión de navegación |
| `fecha_cliente` | Fecha ISO 8601 con zona horaria explícita |
| `propiedades` | Objeto JSON opcional; por defecto `{}` |

Reglas de integración:
- Generar los UUID con `crypto.randomUUID()`.
- Conservar el mismo `id` al reintentar un evento.
- Usar un nuevo `id` para una interacción nueva.
- Mantener `session_id` entre los eventos y la petición de registro.
- No enviar `usuario_id` ni `fecha_recepcion`: los completa el backend.
- Los campos adicionales en el nivel principal del body se rechazan.
- `propiedades` admite claves libres actualmente. No enviar contraseñas,
  tokens ni datos personales del formulario.
- `click_boton_crear_cuenta` se genera exclusivamente desde el backend;
  enviarlo a este endpoint devuelve 400.
- Los perfiles analíticos permitidos no habilitan registros públicos
  para esos roles. El registro actual crea únicamente clientes.

Fechas:
- `fecha_cliente` conserva la fecha enviada por frontend.
- No se rechazan fechas por antigüedad o desfase del reloj.
- `fecha_recepcion` se asigna en la base de datos y es la referencia
  de recepción del servidor.
- En el evento interno de cuenta creada, `fecha_cliente` corresponde
  a la hora del backend.

Respuesta 202:
```json
{
  "message": "Evento aceptado"
}
```

Deduplicación:
- La tabla utiliza `id UUID PRIMARY KEY`.
- Reenviar un ID existente devuelve 202 sin insertar otra fila.
- El evento existente no se modifica, aunque cambie el body o el token.
- La deduplicación por ID no impide eventos ficticios con IDs diferentes.

Límites actuales:
- Body máximo: 8 KB.
- Hasta 30 peticiones por minuto por IP.
- Las peticiones rechazadas también consumen el límite.
- Los contadores se mantienen en memoria y se reinician con la API.
- Varias instancias requieren un almacenamiento compartido.
- Antes de desplegar detrás de un proxy, revisar la configuración
  de la IP del cliente.

| Código | Motivo |
|---|---|
| 400 | Datos inválidos, campos adicionales o evento no permitido |
| 401 | Token inválido, expirado o usuario inexistente |
| 403 | Cuenta desactivada |
| 413 | Body mayor a 8 KB |
| 415 | Content-Type distinto de `application/json` |
| 429 | Límite de peticiones excedido |
| 500 | Error interno al guardar el evento público |