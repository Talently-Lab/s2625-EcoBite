# EcoBite — Guía de endpoints de la API

**Referencia:** documentación de Backend del 30/10/2026\
**Base URL local:** `http://localhost:3000/api`\
**Para:** Frontend y QA

> Los ejemplos muestran el formato de las peticiones y respuestas; los IDs y demás valores son ilustrativos. Cuando una respuesta no está detallada en la documentación original, se indica para validarla con Postman antes de usarla como contrato definitivo.

## 1. Antes de consumir la API

- **JSON:** enviar `Content-Type: application/json` cuando exista un body.
- **Token:** las rutas protegidas requieren `Authorization: Bearer <token>`.
- **Sesión:** el token se obtiene en el login, dura **2 horas** y no tiene refresh; al expirar, volver al login.
- **Errores:** se devuelven como `{ "error": "mensaje" }`.
- **Tamaño máximo del body:** 100 KB en general; **8 KB** para `/eventos`.
- **Datos:** los restaurantes, platos y pedidos de la aplicación se consultan mediante la API. Los mocks de Frontend no deben usarse como datos definitivos.

| Código | Significado |
|---|---|
| `200` | Consulta o actualización correcta |
| `201` | Recurso creado |
| `202` | Evento aceptado |
| `400` | Datos, parámetros o formato inválidos |
| `401` | Credenciales o token ausentes, inválidos o vencidos |
| `403` | Cuenta desactivada o permisos insuficientes |
| `404` | Ruta o recurso no encontrado, o recurso no disponible según la ruta |
| `409` | Registro duplicado o conflicto con el estado actual |
| `413` | Body demasiado grande |
| `415` | Tipo de contenido no admitido |
| `429` | Demasiadas peticiones |
| `500` | Error interno |

### Rutas disponibles

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Iniciar sesión |
| `POST` | `/usuarios/registrar` | Público | Registrar cliente |
| `GET` | `/usuarios/perfil` | Con token | Consultar datos del usuario autenticado |
| `GET` | `/restaurantes` | Sin token indicado | Listar restaurantes |
| `GET` | `/health` | Sin token indicado | Verificar la API |
| `POST` | `/eventos` | Token opcional | Registrar interacción del formulario |
| `GET` | `/restaurantes/:restauranteId/platos` | Público | Listar platos activos |
| `POST` | `/restaurantes/:restauranteId/platos` | Admin / gerente autorizado | Crear plato |
| `PATCH` | `/restaurantes/:restauranteId/platos/:platoId` | Admin / gerente autorizado | Editar plato |
| `PATCH` | `/restaurantes/:restauranteId/platos/:platoId/estado` | Admin / gerente autorizado | Activar o desactivar plato |
| `POST` | `/pedidos` | Cliente | Crear pedido |
| `GET` | `/pedidos/restaurante` | Gerente | Listar pedidos del restaurante |
| `PATCH` | `/pedidos/:pedidoId/listo` | Gerente | Marcar pedido como listo |
| `GET` | `/pedidos/:pedidoId` | Cliente propietario | Consultar su pedido |
| `GET` | `/envios/disponibles` | Delivery | Listar envíos disponibles de restaurantes asociados |
| `PATCH` | `/envios/:envioId/aceptar` | Delivery | Aceptar un envío disponible |
| `PATCH` | `/envios/:envioId/iniciar` | Delivery asignado | Iniciar el traslado |
| `PATCH` | `/envios/:envioId/entregar` | Delivery asignado | Confirmar la entrega |

**Parámetros de ruta:** `:restauranteId`, `:platoId`, `:pedidoId` y `:envioId` se reemplazan por UUID reales.

---

## 2. Autenticación y usuarios

### `POST /auth/login`

Inicia sesión y devuelve un token.

**Body obligatorio**

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Email de la cuenta; se eliminan espacios externos y se convierte a minúsculas |
| `contrasena` | string | Contraseña de la cuenta; más de 72 bytes en UTF-8 devuelve `401` |

```json
{
  "email": "ana.prueba@gmail.com",
  "contrasena": "PruebaSegura2026!"
}
```

**Respuesta `200`**

```json
{
  "token": "eyJ...",
  "usuario": {
    "id": "a5a6e9bc-6b2c-4f7b-aa13-2e0bc09febf9",
    "nombre": "Ana Prueba",
    "email": "ana.prueba@gmail.com",
    "tipoUsuario": {
      "id": "uuid-del-rol",
      "nombreRol": "cliente",
      "nivelAcceso": "propio"
    }
  }
}
```

**A tener en cuenta:** 20 intentos por IP cada 15 minutos. No se exige el mínimo de 15 caracteres a contraseñas de cuentas ya existentes.\
**Errores principales:** `400` datos faltantes, `401` credenciales inválidas, `413`, `429`.\
**Para QA:** probar credenciales correctas, contraseña incorrecta y límite de intentos.

### `POST /usuarios/registrar`

Registra una cuenta nueva con rol **`cliente`**. No inicia sesión automáticamente.

| Campo | Obligatorio | Tipo y reglas |
|---|---|---|
| `nombre` | Sí | string; 1–200 caracteres tras normalizar espacios |
| `email` | Sí | string; máximo 200 caracteres; solo dominios `gmail.com`, `outlook.com`, `hotmail.com` |
| `contrasena` | Sí | string; mínimo 15 caracteres y máximo 72 bytes UTF-8 |
| `session_id` | No | UUID v4 del formulario para tracking |

```json
{
  "nombre": "Ana Prueba",
  "email": "ana.prueba@gmail.com",
  "contrasena": "PruebaSegura2026!",
  "session_id": "d346a28f-c316-471e-b9bc-c468b39593c7"
}
```

**Respuesta `201`**

```json
{
  "message": "Usuario registrado con exito",
  "usuario": {
    "id": "a5a6e9bc-6b2c-4f7b-aa13-2e0bc09febf9",
    "email": "ana.prueba@gmail.com",
    "nombre": "Ana Prueba",
    "tipoUsuario": {
      "id": "uuid-del-rol",
      "nombreRol": "cliente",
      "nivelAcceso": "propio"
    }
  }
}
```

**Para Frontend:** después del `201`, dirigir al login: **este endpoint no devuelve token**. Usar el mismo `session_id` que en los eventos de registro. No enviar `click_boton_crear_cuenta` a `/eventos`: Backend lo crea si el registro tiene éxito. Si el ID falta o es inválido, el usuario igualmente puede registrarse, pero podría perderse la conversión analítica.\
**Límite:** 10 peticiones por IP cada 15 minutos.\
**Errores principales:** `400` datos inválidos, `409` email existente, `413`, `429`.\
**Para QA:** probar registro correcto, email repetido, dominios no permitidos y contraseña corta.

### `GET /usuarios/perfil`

**Acceso:** Bearer Token. **Body:** ninguno.

**Respuesta `200`**

```json
{
  "usuario": {
    "id": "a5a6e9bc-6b2c-4f7b-aa13-2e0bc09febf9",
    "email": "ana.prueba@gmail.com",
    "tipoUsuarioId": "uuid-del-rol",
    "iat": 1791419584,
    "exp": 1791426784
  }
}
```

**Importante:** la respuesta documentada contiene estos datos; no incluye `nombre` ni un objeto `tipoUsuario`.\
**Error documentado:** `401` sin token, token inválido o vencido.\
**Para QA:** consultar con token válido y sin token.

---

## 3. Restaurantes

### `GET /restaurantes`

Devuelve un **arreglo de restaurantes**. **Body:** ninguno.

**Respuesta (ejemplo del archivo original)**

```json
[
  {
    "id": "7be4dd88-9bff-4994-b985-073256525740",
    "nombre": "Raiz Organica",
    "imagenUrl": null,
    "domicilio": "Calle Durango 45, CDMX",
    "latitude": "19.4194",
    "longitude": "-99.1627"
  }
]
```

| Campo de respuesta | Uso en Frontend |
|---|---|
| `id` | Identificar el restaurante y consultar sus platos |
| `nombre` | Mostrar nombre |
| `imagenUrl` | Mostrar imagen; puede ser `null` |
| `domicilio` | Mostrar dirección |
| `latitude`, `longitude` | Coordenadas recibidas como texto en el ejemplo |

**Importante:** si `imagenUrl` es `null`, mostrar una imagen de respaldo. El archivo original no especifica errores ni si el listado filtra restaurantes inactivos; confirmar esos detalles con la API.\
**Para QA:** comprobar estructura de campos y comportamiento con imagen nula.

---

## 4. Platos

### `GET /restaurantes/:restauranteId/platos`

**Acceso:** público. **Body:** ninguno.\
**Parámetro:** `restauranteId` (UUID válido).

Devuelve un arreglo de **platos activos** de un restaurante activo, ordenados por nombre e ID. Si no hay platos disponibles, responde `200` con `[]`.

**Respuesta `200` — ejemplo con un plato:**

```json
[
  {
    "id": "075a0868-3e04-4fd9-9995-92af6227937e",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "nombre": "Ensalada verde",
    "imagenUrl": null,
    "precio": "100",
    "cantidadVasos": 0,
    "cantidadPlatos": 1,
    "cantidadCubiertos": 1,
    "cantidadRecipiente": 0
  }
]
```

El listado solo devuelve platos activos, pero no incluye el campo
`activo`. `precio` llega como texto decimal e `imagenUrl` puede ser `null`.

**Errores:** `400` UUID inválido; `404` restaurante inexistente o inactivo.\
**Para Frontend:** consumir este endpoint para construir el menú; no tomar los productos de mocks.\
**Para QA:** probar restaurante válido con platos, sin platos y UUID inválido.

### `POST /restaurantes/:restauranteId/platos`

Crea un plato dentro del restaurante indicado.

**Acceso:** `admin` (cualquier restaurante activo) o `gerente_restaurante` (solo el suyo), con token y cuenta activa.

| Campo | Obligatorio | Tipo y reglas |
|---|---|---|
| `restauranteId` | En URL | UUID del restaurante |
| `nombre` | Sí | string; 1–200 caracteres tras normalizar espacios |
| `precio` | Sí | Número o string decimal; mayor que 0, máximo `99999999.99`, hasta 2 decimales |
| `cantidadVasos` | No | Entero ≥ 0; por defecto 0 |
| `cantidadPlatos` | No | Entero ≥ 0; por defecto 0 |
| `cantidadCubiertos` | No | Entero ≥ 0; por defecto 0 |
| `cantidadRecipiente` | No | Entero ≥ 0; por defecto 0 |

Las cantidades tienen máximo `2147483647` y no aceptan `null`.

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

**Respuesta `201`**

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

**Importante:** se crea activo y sin imagen. No enviar `restauranteId`, `imagenUrl` ni `activo` dentro del body. La carga de imágenes todavía no está implementada. El precio de respuesta es texto y puede omitir ceros finales.\
**Errores:** `400`, `401`, `403`, `404`.\
**Para QA:** probar gerente de otro restaurante, precio inválido y campos extra.

### `PATCH /restaurantes/:restauranteId/platos/:platoId`

Actualiza uno o varios campos del plato.

**Acceso:** mismos permisos que crear platos. **Parámetros:** `restauranteId` y `platoId` (UUID).

**Body:** enviar **al menos uno** de los campos permitidos en el POST (`nombre`, `precio`, `cantidadVasos`, `cantidadPlatos`, `cantidadCubiertos`, `cantidadRecipiente`), con las mismas validaciones.

```json
{
  "precio": "90.00"
}
```

**Respuesta `200`:** mensaje `"Plato actualizado con éxito"` y objeto `plato` actualizado.\
**Importante:** los campos omitidos no cambian; puede editarse un plato inactivo, pero no se modifica su estado ni su imagen. El plato debe pertenecer al restaurante de la URL.\
**Errores:** `400`, `401`, `403`, `404`.\
**Para QA:** probar cambio parcial, body vacío y plato de otro restaurante.

### `PATCH /restaurantes/:restauranteId/platos/:platoId/estado`

Activa o desactiva un plato sin eliminarlo.

**Acceso:** mismos permisos que crear platos. **Parámetros:** `restauranteId` y `platoId` (UUID).

**Body obligatorio**

| Campo | Tipo | Regla |
|---|---|---|
| `activo` | boolean | Solo `true` o `false`, no texto |

```json
{
  "activo": false
}
```

**Respuesta `200`**

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

**Importante:** al desactivar, desaparece del listado público; al reactivar, vuelve a aparecer. Enviar el mismo valor otra vez no invierte el estado.\
**Errores:** `400`, `401`, `403`, `404`.\
**Para QA:** probar `false`, `true` y el valor incorrecto `"false"` (string).

---

## 5. Pedidos

### `POST /pedidos`

Crea un pedido, sus artículos y el envío asociado en una misma operación.

**Acceso:** token de un usuario activo con rol `cliente`.

| Campo | Obligatorio | Tipo y reglas |
|---|---|---|
| `restauranteId` | Sí | UUID de un restaurante activo |
| `domicilioDestino` | Sí | string; 1–500 caracteres tras normalizar espacios |
| `items` | Sí | Array con al menos un elemento |
| `items[].platoId` | Sí | UUID de un plato activo del mismo restaurante |
| `items[].cantidad` | Sí | Entero entre 1 y `2147483647` |

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

**Respuesta `201` (ejemplo independiente del precio usado en la sección de platos)**

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

**Importante para Frontend:** enviar solo IDs, cantidades y domicilio; **no enviar** precio, total, usuario ni impacto. Backend obtiene precios/envases de la base de datos y calcula el total. No repetir platos dentro de `items`. No hay idempotencia: reenviar la petición puede crear otro pedido.

**Estados iniciales:** pedido `pendiente`, envío `pendiente`, `deliveryId: null` sin repartidor. La distancia del MVP es fija (`1.5` km) y el domicilio no se valida geográficamente.

**Campos de respuesta:** importes, distancia e impactos llegan como texto decimal. `precioUnitario` y envases guardan el valor histórico por unidad; pueden existir cantidades de envases `null` en datos anteriores. `impactoEstimado` es calculado (no un total persistido): envases = unidades × envases por unidad × 50 g; transporte = `max(distanciaKm - 1.5, 0) × 80 g`. Los ahorros pueden ser `null` si falta información.

**Errores:** `400` datos inválidos/platos duplicados/no disponibles/total fuera de rango; `401`, `403`, `404` restaurante inexistente/inactivo; `500`.\
**Para QA:** probar pedido válido, plato repetido, plato inactivo, rol incorrecto y cantidad negativa.

### `GET /pedidos/restaurante`

Consulta los pedidos del restaurante asignado al gerente.

**Acceso:** token de `gerente_restaurante` activo con restaurante asignado. **Body:** ninguno.

**Query params (opcionales)**

| Campo | Valor por defecto | Regla |
|---|---|---|
| `pagina` | `1` | Entero positivo |
| `limite` | `20` | Entero entre 1 y 100 |

**Ejemplo:** `GET /pedidos/restaurante?pagina=1&limite=2`

**Respuesta `200`**

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
          "plato": { "nombre": "Ensalada verde" }
        }
      ]
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 2,
    "total": 1,
    "totalPaginas": 1
  }
}
```

**Importante:** el ejemplo representa un restaurante con un solo pedido. El listado real incluye todos los estados, ordenados del más reciente al más antiguo. `total` cuenta todos los pedidos del restaurante y `totalPaginas = ceil(total / limite)`. El restaurante se determina a partir del token; un `restauranteId` enviado como query no modifica la consulta. El nombre del plato es el actual, pero el precio es histórico.

Una página vacía devuelve `200`, `"pedidos": []` y la información de paginación.\
**Errores:** `400` paginación inválida; `401`, `403` rol/cuenta o gerente sin restaurante; `500`.\
**Para QA:** probar paginación válida, `limite=101`, página sin resultados y gerente sin restaurante.

### `PATCH /pedidos/:pedidoId/listo`

Marca como listo un pedido del restaurante del gerente.

**Acceso:** token de `gerente_restaurante` activo con restaurante asignado.\
**Parámetro:** `pedidoId` (UUID). **Body:** ninguno.

**Ejemplo:** `PATCH /pedidos/96508f98-a4c4-4f83-a8ee-c84fc4fc1b03/listo`

**Respuesta `200`**

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

**Regla principal:** solo permite `pendiente → listo`. No asigna repartidor ni cambia el estado del envío. Repetir la operación en un pedido que ya no está pendiente devuelve `409`.\
**Errores:** `400`, `401`, `403`, `404` pedido inexistente/ajeno, `409`, `500`.\
**Para QA:** probar pedido pendiente, segundo intento (`409`) y pedido de otro restaurante (`404`).

### `GET /pedidos/:pedidoId`

Consulta los datos de un pedido propio.

**Acceso:** token de `cliente` activo.\
**Parámetro:** `pedidoId` (UUID). **Body:** ninguno.

**Respuesta `200` — ejemplo de un pedido entregado:**

```json
{
  "pedido": {
    "id": "e7e9c73f-7e46-41ca-b90a-6f27d43a1cbd",
    "usuarioId": "a5a6e9bc-6b2c-4f7b-aa13-2e0bc09febf9",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "fecha": "2026-10-29T21:31:05.838Z",
    "estado": "entregado",
    "montoTotal": "200",
    "items": [
      {
        "id": "cf5866d4-5143-4ee9-85a8-01cc97b04c99",
        "pedidoId": "e7e9c73f-7e46-41ca-b90a-6f27d43a1cbd",
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
      "id": "9dde6b4a-a123-494a-a6ed-547aad2742d6",
      "pedidoId": "e7e9c73f-7e46-41ca-b90a-6f27d43a1cbd",
      "fechaEnvio": "2026-10-29T21:31:05.860Z",
      "fechaAceptacion": "2026-10-29T21:40:41.115Z",
      "fechaEntrega": "2026-10-29T23:34:07.272Z",
      "deliveryId": "cb232a47-0154-4c5d-9178-6078f86bc125",
      "distanciaKm": "1.5",
      "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
      "domicilioDestino": "Calle Primavera 123",
      "estado": "entregado"
    },
    "impactoEstimado": {
      "ahorroEnvasesGramos": "200",
      "ahorroTransporteGramos": "0.00"
    }
  }
}
```

- Los precios y envases son valores históricos.
- `envio` puede ser `null` en pedidos anteriores; en ese caso `ahorroTransporteGramos` también es `null`.
- `ahorroEnvasesGramos` puede ser `null` si faltan datos de envases.
- No se permite consultar pedidos de otros clientes.

**Errores:** `400`, `401`, `403`, `404` pedido inexistente/ajeno, `500`.\
**Para QA:** consultar pedido propio, pedido de otro cliente y UUID inválido.

---
## 6. Envíos

**Acceso:** todas estas rutas requieren Bearer Token, cuenta activa,
rol `delivery` y perfil delivery registrado.

El backend obtiene el delivery del usuario autenticado.
No se envía `deliveryId` ni body en estas peticiones.

### `GET /envios/disponibles`

Lista los envíos que el delivery puede aceptar.

**Query params opcionales:**

| Campo | Predeterminado | Regla |
|---|---|---|
| `pagina` | 1 | Entero positivo |
| `limite` | 20 | Entero entre 1 y 100 |

**Ejemplo:** `GET /envios/disponibles?pagina=1&limite=20`

Solo muestra envíos pendientes, sin delivery asignado, con pedido
listo y de restaurantes asociados al delivery autenticado.
Se ordenan por fecha de creación ascendente y luego por ID.

El estado corresponde al momento de la consulta. Antes de la asignación,
`deliveryId` y `fechaAceptacion` son `null`; antes de la entrega,
`fechaEntrega` es `null`.

Una página sin resultados devuelve `200` con `envios: []`.
Si no hay envíos disponibles, `total` y `totalPaginas` son 0.
El listado no incluye el domicilio del cliente.

El listado y el conteo se consultan por separado; pueden diferir
si otro delivery acepta un envío durante la consulta.

### `PATCH /envios/:envioId/aceptar`

Asigna el envío al delivery autenticado y registra `fechaAceptacion`.

**Parámetro:** `envioId`, UUID del envío, no del pedido.
**Body:** ninguno.

Exige las mismas condiciones que el listado de disponibles.
La asignación es condicional: dos deliveries no pueden aceptar
el mismo envío. Repetir la aceptación devuelve `409`.

**Respuesta `200`:**

```json
{
  "message": "Envio aceptado con exito",
  "envio": {
    "id": "9dde6b4a-a123-494a-a6ed-547aad2742d6",
    "pedidoId": "e7e9c73f-7e46-41ca-b90a-6f27d43a1cbd",
    "restauranteId": "7be4dd88-9bff-4994-b985-073256525740",
    "deliveryId": "cb232a47-0154-4c5d-9178-6078f86bc125",
    "domicilioDestino": "Calle Primavera 123",
    "distanciaKm": "1.5",
    "estado": "pendiente",
    "fechaEnvio": "2026-10-29T21:31:05.860Z",
    "fechaAceptacion": "2026-10-29T21:40:41.115Z",
    "fechaEntrega": null,
    "restaurante": {
      "nombre": "Raiz Organica",
      "domicilio": "Calle Durango 45, CDMX"
    }
  }
}
```

Aceptar conserva el envío `pendiente` y el pedido `listo`.
El envío deja de aparecer entre los disponibles.
La respuesta ya incluye el domicilio del cliente.

### `PATCH /envios/:envioId/iniciar`

Inicia el traslado de un envío previamente aceptado.

**Parámetro:** `envioId`, UUID del envío.
**Body:** ninguno.

Solo puede hacerlo el delivery asignado. El envío debe estar
`pendiente`, con fecha de aceptación, y el pedido debe estar `listo`.

**Respuesta `200`:** misma estructura `{ "message": "...", "envio": { ... } }`
y los mismos campos del ejemplo de aceptación, con:

- `message`: `"Traslado iniciado con exito"`.
- `envio.estado`: `"en_transito"`.
- `fechaAceptacion`: conserva su valor.
- `fechaEntrega`: `null`.

El pedido también pasa a `en_transito`.
Ambos cambios se ejecutan en una transacción.
Repetir el inicio devuelve `409`.

### `PATCH /envios/:envioId/entregar`

Confirma la entrega al cliente.

**Parámetro:** `envioId`, UUID del envío.
**Body:** ninguno.

Solo puede hacerlo el delivery asignado. Envío y pedido deben
estar `en_transito`, y el envío no debe tener fecha de entrega.

**Respuesta `200`:** misma estructura y campos del ejemplo de aceptación, con:

- `message`: `"Entrega confirmada con exito"`.
- `envio.estado`: `"entregado"`.
- `fechaAceptacion`: conserva su valor.
- `fechaEntrega`: fecha de la entrega, por ejemplo
  `"2026-10-29T23:34:07.272Z"`.

El pedido también pasa a `entregado`.
Ambos cambios se ejecutan en una transacción.
Repetir la entrega devuelve `409` y no modifica la fecha original.

### Estados del flujo

| Acción | Pedido | Envío |
|---|---|---|
| Crear pedido | `pendiente` | `pendiente`, sin delivery |
| Gerente marca listo | `listo` | `pendiente`, sin delivery |
| Delivery acepta | `listo` | `pendiente`, con delivery |
| Delivery inicia traslado | `en_transito` | `en_transito` |
| Delivery confirma entrega | `entregado` | `entregado` |

Este flujo termina en `entregado`; no cambia automáticamente
el pedido a `completado`. La cancelación todavía no está implementada.

Las fechas se devuelven en formato ISO 8601; `Z` indica UTC.
Frontend puede convertirlas a la zona horaria de visualización.
`distanciaKm` se devuelve como texto decimal.

### Errores de envíos

| Código | Motivo |
|---|---|
| `400` | UUID inválido en PATCH o paginación inválida en GET |
| `401` | Token ausente, inválido o expirado; usuario inexistente |
| `403` | Cuenta desactivada, rol no permitido o perfil delivery inexistente |
| `409` | El envío no cumple las condiciones de la acción solicitada |
| `500` | Error interno |

En los PATCH, un UUID válido pero inexistente, un envío ajeno
o un estado incompatible devuelve `409`, sin distinguir esos casos.

**Mensajes de conflicto del envío:**

- Aceptar: `"El envio no esta disponible para tu cuenta"`.
- Iniciar: `"El envio no esta disponible para iniciar el traslado"`.
- Entregar: `"El envio no esta disponible para confirmar la entrega"`.

Si falla la actualización del pedido al iniciar o entregar,
la transacción revierte también el cambio del envío.

---


## 7. Tracking del registro

### `POST /eventos`

Guarda un evento del formulario en `analytics.eventos`.

**Acceso:** token opcional. Sin token, `usuario_id` se guarda como `null`; si se envía un token inválido, responde `401`.

| Campo | Obligatorio | Tipo y reglas |
|---|---|---|
| `id` | Sí | UUID v4 único por interacción |
| `nombre_evento` | Sí | `visita_pagina_registro` o `click_campo_email` |
| `rol_usuario` | Sí | `cliente`, `gerente_restaurante`, `admin`, `delivery` |
| `session_id` | Sí | UUID v4 compartido por la sesión del formulario |
| `fecha_cliente` | Sí | Fecha ISO 8601 con zona horaria |
| `propiedades` | No | Objeto JSON; por defecto `{}` |

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

**Respuesta `202`**

```json
{ "message": "Evento aceptado" }
```

**Flujo para Frontend:**

1. Crear `session_id` con `crypto.randomUUID()` y conservarlo durante el formulario.
2. Al visitar registro, enviar `visita_pagina_registro`; al enfocar email, `click_campo_email`.
3. Al registrar, enviar el mismo `session_id` a `POST /usuarios/registrar`.
4. **No enviar** `click_boton_crear_cuenta`: lo registra Backend solo si se crea la cuenta.

**Importante:** generar otro `id` para cada evento nuevo; al reintentar el mismo evento, reutilizar su `id` (duplicados devuelven `202` sin insertar otra fila). No enviar `usuario_id`, `fecha_recepcion`, campos extra ni datos sensibles dentro de `propiedades`. El servidor asigna `fecha_recepcion`; `fecha_cliente` conserva lo enviado, aun con desfases de reloj. `rol_usuario` no otorga permisos.

**Límite:** 8 KB por body y 30 peticiones por minuto por IP.\
**Errores:** `400` evento/campos inválidos, `401`, `403` cuenta desactivada, `413`, `415`, `429`, `500`.\
**Para QA:** probar ambos eventos permitidos, UUID repetido, tercer evento enviado por error y campos extra.

---

## 8. Salud de la API

### `GET /health`

Comprueba que la API responde. **Body:** ninguno.

**Respuesta `200`**

```json
{ "status": "ok" }
```

**Para QA:** usarlo como prueba inicial de conectividad; no verifica por sí solo el funcionamiento de todas las rutas o la base de datos.

---

## 9. Datos de prueba e integración

**Origen de los datos:** Frontend debe consultar la API para obtener restaurantes, platos y pedidos; la base de datos es la fuente de los registros de la aplicación. Los ejemplos de este documento no garantizan que esos IDs existan en cada instalación.

**Seed (datos iniciales):**está pendiente agregar una seed con usuarios de prueba, restaurantes, platos y sus relaciones para que Frontend y QA puedan probar los mismos casos. Los datos creados manualmente en mi base local no se incluyen al descargar el repositorio.

**Imágenes:** `imagenUrl` puede llegar como `null`. La subida de imágenes de platos está pendiente. Cuando se implemente, la API deberá devolver una URL que Frontend pueda utilizar; no basta con la ruta interna del filesystem del backend.

### Casos mínimos para QA

| Caso | Resultado esperado |
|---|---|
| Registro válido → login | `201` al registrar; `200` y token al iniciar sesión |
| Email ya registrado | `409` |
| Consultar platos de un restaurante activo sin platos activos | `200` y `[]` |
| Crear plato con cliente | `403` |
| Crear pedido con plato repetido | `400` |
| Marcar pedido pendiente como listo | `200`, estado `listo` |
| Volver a marcar el mismo pedido como listo | `409` |
| Consultar un pedido de otro cliente | `404` |
| Reenviar un evento con el mismo `id` | `202` y sin duplicar registro |
| Dos deliveries intentan aceptar el mismo envío disponible | Uno recibe `200` y el otro `409` |
| Iniciar un envío asignado a otro delivery | `409` |
| Entregar un envío aceptado sin iniciar traslado | `409` |
| Entregar un envío propio en tránsito | `200`; pedido y envío quedan `entregado` |
| Repetir la entrega | `409`; la fecha de entrega no cambia |

### Pendientes de completar en la documentación

- [ ] Confirmar reglas de acceso y filtrado de `GET /restaurantes`.
- [ ] Documentar ejecución de seed y datos de prueba disponibles.
- [ ] Documentar endpoint y formato final de imágenes cuando se implemente.


> **Nota de alcance:** los endpoints de envíos fueron implementados y probados localmente en `feature/endpoints-pedidos`; su disponibilidad en `main` depende de integrar la rama. La subida de imágenes y la cancelación todavía no están implementadas.
