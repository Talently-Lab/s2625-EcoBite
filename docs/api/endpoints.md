# API EcoBite - Endpoints

**Última actualización:** 2026-10-18
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
| 403 | Cuenta desactivada o permisos insuficientes |
| 404 | Ruta inexistente |
| 409 | El registro ya existe (por ejemplo, email duplicado) |
| 413 | El cuerpo supera el límite: 8 KB en eventos y 100 KB en las demás rutas |
| 415 | Content-Type no admitido |
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
{
  "nombre": "Ana Prueba",
  "email": "ana.prueba@gmail.com",
  "contrasena": "PruebaSegura2026!",
  "session_id": "d346a28f-c316-471e-b9bc-c468b39593c7"
}
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
- `session_id` se utiliza para tracking; los demás campos adicionales se ignoran.
- Límite: 10 peticiones por IP cada 15 minutos.


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


---

## Platos

Las rutas siguientes usan la Base URL: `http://localhost:3000/api`.

### GET /restaurantes/:restauranteId/platos

**Acceso:** público, sin token.

Devuelve los platos activos de un restaurante activo, ordenados por nombre e ID.
Si no tiene platos disponibles, devuelve `[]`.

**Respuesta:** 200 con un arreglo de platos.

**Errores:**
- 400: UUID inválido.
- 404: restaurante inexistente o inactivo.

### POST /restaurantes/:restauranteId/platos

**Acceso:** requiere Bearer Token y cuenta activa.
- `admin`: puede crear platos en cualquier restaurante activo.
- `gerente_restaurante`: solo en su restaurante asignado.

**Body:**

```json
{
  "nombre": "Ensalada verde",
  "precio": "85.50",
  "cantidadVasos": 0,
  "cantidadPlatos": 1,
  "cantidadCubiertos": 1,
  "cantidadRecipiente": 0
}
```

**Reglas:**
- El body debe ser un objeto JSON.
- `nombre`: obligatorio, entre 1 y 200 caracteres después de normalizar espacios. Conserva las mayúsculas y minúsculas recibidas.
- `precio`: obligatorio, mayor que cero, hasta 99999999.99 y con máximo dos decimales. Acepta número o texto decimal con punto.
- Las cantidades deben ser enteros entre 0 y 2147483647. Si se omiten al crear, valen cero; no aceptan null.
- El restaurante se obtiene de la URL.
- No se aceptan campos adicionales, incluidos `restauranteId`, `activo` e `imagenUrl`.
- El plato se crea activo y sin imagen.
- La subida de imágenes está pendiente de implementación.

**Respuesta 201:**

```json
{
  "message": "Plato creado con éxito",
  "plato": {
    "id": "075a0868-3e04-4fd9-9995-92af6227937e",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "nombre": "Ensalada verde",
    "imagenUrl": null,
    "precio": "85.5",
    "activo": true,
    "cantidadVasos": 0,
    "cantidadPlatos": 1,
    "cantidadCubiertos": 1,
    "cantidadRecipiente": 0
  }
}
```

Los precios se devuelven como texto decimal y pueden omitir ceros finales.
El frontend puede mostrarlos con dos decimales.

### PATCH /restaurantes/:restauranteId/platos/:platoId

**Acceso:** requiere los mismos permisos que la creación.

Acepta los mismos campos del POST, pero solo exige enviar al menos uno.
Los campos omitidos conservan su valor.

**Body de ejemplo:**

```json
{
  "precio": "90.00"
}
```

**Respuesta:** 200 con el mensaje `"Plato actualizado con éxito"` y el objeto `plato` actualizado.

**Reglas:**
- El restaurante debe estar activo.
- El plato debe pertenecer al restaurante de la URL.
- Se puede editar un plato desactivado sin reactivarlo.
- Este endpoint no modifica el estado ni la imagen.

### PATCH /restaurantes/:restauranteId/platos/:platoId/estado

**Acceso:** requiere los mismos permisos que la creación.

El body acepta únicamente `activo`, de tipo booleano.

**Body para desactivar:**

```json
{
  "activo": false
}
```

Para reactivar, envía `{"activo": true}`.

**Respuesta 200:**

```json
{
  "message": "Estado del plato actualizado con éxito",
  "plato": {
    "id": "075a0868-3e04-4fd9-9995-92af6227937e",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "nombre": "Ensalada verde",
    "activo": false
  }
}
```

**Reglas:**
- El restaurante debe estar activo y el plato debe pertenecerle.
- Desactivar retira el plato del listado público, pero no elimina el registro.
- Reactivar permite que vuelva a aparecer.
- Repetir el mismo estado no lo alterna.
- No acepta `"true"` o `"false"` como texto.

### Errores de las operaciones protegidas de platos

| Código | Motivo |
|---|---|
| 400 | Identificadores, campos o valores inválidos |
| 401 | Token ausente, inválido o expirado; usuario inexistente |
| 403 | Cuenta desactivada, rol no autorizado o restaurante ajeno al gerente |
| 404 | Restaurante inexistente/inactivo o plato que no pertenece al restaurante indicado |
