# API EcoBite - Endpoints

**Última actualización:** 2026-10-26
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



---

## Pedidos

### POST /pedidos

Crea un pedido con sus detalles y su envío.

**Autenticación:** requiere token de un usuario activo con rol `cliente`.

Body:

```json
{
  "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
  "domicilioDestino": "Calle Primavera 123",
  "items": [
    {
      "platoId": "075a0868-3e04-4fd9-9995-92af6227937e",
      "cantidad": 2
    }
  ]
}
```

Reglas:

- El body debe ser un objeto JSON. Se rechazan campos no permitidos.
- `restauranteId` y cada `platoId` deben ser UUID válidos.
- El restaurante debe existir y estar activo.
- `items` debe contener al menos un elemento.
- Cada elemento admite únicamente `platoId` y `cantidad`.
- No se permiten platos repetidos; sus unidades se indican en `cantidad`.
- `cantidad` debe ser un entero entre 1 y 2147483647.
- Todos los platos deben estar activos y pertenecer al restaurante indicado.
- `domicilioDestino` es obligatorio: texto de 1 a 500 caracteres después
  de normalizar espacios. No se verifica geográficamente la dirección.
- El usuario se obtiene del token; no se recibe `usuarioId` en el body.
- Los precios y las cantidades de envases se obtienen de la base de datos.
- El total se calcula en el backend y no puede superar 99999999.99.
- Pedido, detalles y envío se guardan dentro de una misma transacción.
  Si falla una operación, se revierten las escrituras de esa transacción.

Respuesta 201 — ejemplo con dos unidades a 100:

```json
{
  "message": "Pedido creado con éxito",
  "pedido": {
    "id": "c7662d18-3161-4e19-ac56-767f47947aca",
    "usuarioId": "a5a6e9bc-6b2c-4f7b-aa13-2e0bc09febf9",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "fecha": "2026-10-23T02:21:42.402Z",
    "estado": "pendiente",
    "montoTotal": "200",
    "items": [
      {
        "id": "2452c44b-433b-41a7-86d0-fbac0d9652b3",
        "platoId": "075a0868-3e04-4fd9-9995-92af6227937e",
        "cantidad": 2,
        "precioUnitario": "100",
        "cantidadVasos": 0,
        "cantidadPlatos": 1,
        "cantidadCubiertos": 1,
        "cantidadRecipiente": 0
      }
    ],
    "envio": {
      "pedidoId": "c7662d18-3161-4e19-ac56-767f47947aca",
      "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
      "domicilioDestino": "Calle Primavera 123",
      "deliveryId": null,
      "distanciaKm": "1.5",
      "estado": "pendiente",
      "fechaEnvio": "2026-10-23T02:21:42.447Z"
    },
    "impactoEstimado": {
      "ahorroEnvasesGramos": "200",
      "ahorroTransporteGramos": "0.00"
    }
  }
}
```

Interpretación:

- `precioUnitario` y las cantidades de envases corresponden a una unidad
  del plato y conservan los valores al crear el pedido.
- Cambiar posteriormente el plato no modifica esos valores históricos.
- Las cantidades de envases pueden ser `null` cuando no se dispone
  de esa información; `null` no significa cero.
- El pedido y el envío comienzan en `pendiente`.
- `deliveryId: null` indica que todavía no hay repartidor asignado.
- La distancia del MVP es fija: 1.50 km.
- `fechaEnvio` registra la creación del envío, no su aceptación
  por el delivery ni su entrega al cliente.
- Los importes y la distancia se devuelven como texto decimal;
  pueden aparecer sin ceros finales.

Impacto estimado:

- Se calcula para la respuesta; no se guarda como un total en una columna.
- Envases: suma de unidades pedidas × envases por unidad × 50 gramos.
- Si falta alguna cantidad de envases, `ahorroEnvasesGramos` devuelve `null`.
- Transporte: máximo(distanciaKm − 1.5, 0) × 80 gramos.
  Con la distancia fija actual, devuelve `"0.00"`.
- Ambos resultados se expresan en gramos y se devuelven como texto
  cuando están disponibles.
- El impacto de un pedido pendiente es estimado. Las consultas
  del dashboard deberán aplicar el filtro de pedidos completados.

Errores:

| Código | Motivo |
|---|---|
| 400 | Datos inválidos, campos adicionales, platos repetidos o no disponibles, o total fuera de rango |
| 401 | Token ausente, inválido o expirado; usuario autenticado inexistente |
| 403 | Cuenta desactivada o rol distinto de cliente |
| 404 | Restaurante inexistente o inactivo |
| 500 | Error interno; la transacción no guarda parcialmente el pedido |

Limitaciones actuales:

- Repetir una petición válida crea otro pedido: todavía no hay idempotencia.
- No se implementan en este endpoint pagos ni cambios posteriores de estado.
- La asignación y aceptación del delivery se implementarán por separado.

### GET /pedidos/restaurante

Lista los pedidos del restaurante asignado al gerente autenticado.

**Autenticación:** requiere token de un usuario activo con rol
`gerente_restaurante` y restaurante asignado.

**Método:** GET
**URL de ejemplo:** `http://localhost:3000/api/pedidos/restaurante?pagina=1&limite=2`
**Body:** no se envía.

Parámetros opcionales:

| Parámetro | Predeterminado | Reglas |
|---|---|---|
| pagina | 1 | Entero positivo |
| limite | 20 | Entero entre 1 y 100 |

Reglas:

- El restaurante se obtiene del usuario autenticado.
- Enviar `restauranteId` en la URL no cambia el restaurante consultado:
  ese parámetro se ignora.
- Devuelve pedidos de todos los estados.
- Los pedidos se ordenan del más reciente al más antiguo,
  con desempate por ID.
- El nombre del plato corresponde al menú actual.
- El precio unitario corresponde al valor guardado al crear el pedido.
- No modifica registros.

Respuesta 200 — ejemplo con siete pedidos y límite de dos:

```json
{
  "pedidos": [
    {
      "id": "96508f98-a4c4-4f83-a8ee-c84fc4fc1b03",
      "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
      "fecha": "2026-10-23T03:15:34.598Z",
      "estado": "pendiente",
      "montoTotal": "200",
      "items": [
        {
          "platoId": "075a0868-3e04-4fd9-9995-92af6227937e",
          "cantidad": 2,
          "precioUnitario": "100",
          "plato": {
            "nombre": "Ensalada verde"
          }
        }
      ]
    },
    {
      "id": "d541792c-6210-4a62-bc33-2cbe330cfba7",
      "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
      "fecha": "2026-10-23T02:59:48.685Z",
      "estado": "pendiente",
      "montoTotal": "200",
      "items": [
        {
          "platoId": "075a0868-3e04-4fd9-9995-92af6227937e",
          "cantidad": 2,
          "precioUnitario": "100",
          "plato": {
            "nombre": "Ensalada verde"
          }
        }
      ]
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 2,
    "total": 7,
    "totalPaginas": 4
  }
}
```

Interpretación de la paginación:

- `pagina`: página solicitada.
- `limite`: máximo de pedidos devueltos por página.
- `total`: cantidad total de pedidos del restaurante.
- `totalPaginas`: resultado de dividir `total` entre `limite`,
  redondeado hacia arriba.
- El listado y el conteo se consultan por separado; pueden diferir
  temporalmente si se crean pedidos durante la consulta.

Una página sin resultados devuelve 200 con un arreglo vacío:

```json
{
  "pedidos": [],
  "paginacion": {
    "pagina": 5,
    "limite": 2,
    "total": 7,
    "totalPaginas": 4
  }
}
```

Si el restaurante no tiene pedidos, `total` y `totalPaginas` son 0.

Errores:

| Código | Motivo |
|---|---|
| 400 | Paginación inválida o fuera de rango |
| 401 | Token ausente, inválido o expirado; usuario inexistente |
| 403 | Cuenta desactivada, rol no autorizado o gerente sin restaurante asignado |
| 500 | Error interno del servidor |

Ejemplo de error 400:

```json
{
  "error": "limite no puede superar 100"
}
```

Ejemplo de error 403 para un gerente sin restaurante:

```json
{
  "error": "No tienes un restaurante asignado"
}

```

---

### PATCH /pedidos/:pedidoId/listo

Marca un pedido pendiente como listo para su entrega.

**Autenticación:** requiere token de un usuario activo con rol
`gerente_restaurante` y restaurante asignado.

**Body:** no se envía.

Ejemplo:

`PATCH /api/pedidos/96508f98-a4c4-4f83-a8ee-c84fc4fc1b03/listo`

Reglas:

- `pedidoId` debe ser un UUID válido.
- El pedido debe pertenecer al restaurante del gerente autenticado.
- Solo permite cambiar de `pendiente` a `listo`.
- No permite elegir otro estado mediante el body.
- Repetir la operación sobre un pedido listo devuelve 409.
- No asigna un delivery ni modifica el estado del envío.
- La actualización comprueba el restaurante y el estado pendiente
  en la misma operación de escritura.

Respuesta 200:

```json
{
  "message": "Pedido marcado como listo",
  "pedido": {
    "id": "96508f98-a4c4-4f83-a8ee-c84fc4fc1b03",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "estado": "listo"
  }
}
```

Errores:

| Código | Motivo |
|---|---|
| 400 | Identificador del pedido inválido |
| 401 | Token ausente, inválido o expirado; usuario inexistente |
| 403 | Cuenta desactivada, rol no autorizado o gerente sin restaurante |
| 404 | Pedido inexistente o perteneciente a otro restaurante |
| 409 | El pedido ya no está pendiente |
| 500 | Error interno del servidor |

Ejemplo de error 409:

```json
{
  "error": "Solo puedes marcar como listo un pedido pendiente"
}
```

Un pedido ajeno devuelve el mismo error que uno inexistente:

```json
{
  "error": "Pedido no encontrado"
}
```

---



### GET /pedidos/:pedidoId

Consulta un pedido del cliente autenticado.

**Autenticación:** token de un usuario activo con rol `cliente`.

- `pedidoId` debe ser un UUID válido.
- Solo devuelve pedidos pertenecientes al usuario autenticado.
- No recibe body.
- No modifica registros.

Respuesta 200:

Devuelve `{ "pedido": { ... } }`, incluyendo los datos del pedido,
sus detalles, el envío e `impactoEstimado`.

- Los precios y envases corresponden a los valores históricos guardados.
- `envio` puede ser `null` en pedidos anteriores sin envío.
- `ahorroTransporteGramos` es `null` si no existe envío.
- `ahorroEnvasesGramos` es `null` si falta información de envases.
- Los ahorros disponibles se expresan en gramos como texto.

Errores:

| Código | Motivo |
|---|---|
| 400 | Identificador del pedido inválido |
| 401 | Token ausente, inválido o expirado; usuario inexistente |
| 403 | Cuenta desactivada o rol distinto de cliente |
| 404 | Pedido inexistente o perteneciente a otro cliente |
| 500 | Error interno del servidor |

Un pedido ajeno devuelve el mismo error que uno inexistente:
`{ "error": "Pedido no encontrado" }`.