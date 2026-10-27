# 📄 ESPECIFICACIONES KPI.md: Especificación Técnica de Fórmulas y Reglas de Negocio — EcoBite v2.1

Este documento detalla la especificación oficial de fórmulas, constantes, métricas de negocio, catálogo de envases y consultas SQL de la plataforma **EcoBite v2.1**, estructurado para integración en repositorios (GitHub/GitLab) y documentación técnica de arquitectura de datos.

---

## 1. Constantes Globales del Sistema

| Constante | Valor | Unidad | Descripción |
| :--- | :--- | :--- | :--- |
| **$C_1$** | $80.0$ | $\text{g CO}_2 / \text{km}$ | Factor de emisión base para movilidad convencional (moto a combustión). |
| **$C_2$** | $1.5$ | $\text{km}$ | Umbral de caminabilidad / distancia base constante para versión MVP. |
| **$C_{1R}$** | $50.0$ | $\text{g CO}_2 / \text{envase}$ | Ahorro de $\text{CO}_2$ por recipiente biodegradable vs. plástico convencional. |

---

## 2. Catálogo Oficial de Tipos de Transporte

| ID | Tipo de Transporte | Factor Emisión | Propósito / Categoría |
| :--- | :--- | :--- | :--- |
| **1** | **Bicicleta** | $0\text{ g CO}_2/\text{km}$ | **KPI Ecológico Principal** (Meta: $\ge 60\%$ de las entregas). |
| **2** | **Bicicleta eléctrica** | $\sim 5\text{ g CO}_2/\text{km}$ | Alternativa ecológica de bajo impacto. |
| **3** | **Moto Eléctrica** | $\sim 15\text{ g CO}_2/\text{km}$ | Impacto medio — Alternativa sustentable a motovehículos. |
| **4** | **Auto Eléctrico** | $\sim 40\text{ g CO}_2/\text{km}$ | Impacto medio — Cargas de mayor volumen. |
| **5** | **Moto Convencional** | $80\text{ g CO}_2/\text{km}$ | Emisión base de referencia para cálculo de ahorro. |

---

## 3. Métricas y KPIs de Negocio

### 3.1 Pedidos Totales
* **Descripción:** Cantidad total de pedidos completados en un período de tiempo.
* **Frecuencia:** Diario, Semanal.
* **Meta:** $50+$ pedidos / semana.
* **Fórmula SQL:**
  ```sql
  SELECT COUNT(id) AS pedidos_totales
  FROM PEDIDO
  WHERE estado = 'completado'
    AND fecha >= NOW() - INTERVAL '7 days';
  ```

### 3.2 Ticket Promedio
* **Descripción:** Ingreso promedio por pedido procesado.
* **Frecuencia:** Semanal.
* **Meta:** $\$250\text{ ARS}$ mínimo.
* **Fórmula Matemática:**
  $$\text{Ticket Promedio} = \frac{\sum \text{monto\_total}}{\text{Cantidad de Pedidos Completados}}$$
* **Fórmula SQL:**
  ```sql
  SELECT AVG(monto_total) AS ticket_promedio
  FROM PEDIDO
  WHERE estado = 'completado';
  ```

### 3.3 Restaurantes Activos
* **Descripción:** Cantidad de restaurantes dados de alta y habilitados en la plataforma.
* **Frecuencia:** Semanal.
* **Meta:** $5+$ restaurantes habilitados.
* **Fórmula SQL:**
  ```sql
  SELECT COUNT(*) AS restaurantes_activos
  FROM RESTAURANTE
  WHERE estado = 'activo';
  ```

### 3.4 Distribución por Tipo de Transporte
* **Descripción:** Proporción de entregas según la movilidad utilizada.
* **Meta Eco:** Bicicleta $\ge 60\%$.
* **Fórmula SQL:**
  ```sql
  SELECT 
      t.descripcion AS tipo_transporte,
      COUNT(p.id) AS cantidad_pedidos,
      ROUND(COUNT(p.id) * 100.0 / SUM(COUNT(p.id)) OVER(), 2) AS porcentaje
  FROM PEDIDO p
  JOIN ENVIO e ON p.id = e.pedido_id
  JOIN TIPOTRANSPORTE t ON e.tipo_transporte_id = t.id
  WHERE p.estado = 'completado'
  GROUP BY t.descripcion;
  ```

---

## 4. Métricas e Índices de Impacto Ambiental

### 4.1 Índice de Ahorro — Transporte ($AP$)
Mide el ahorro de $\text{CO}_2$ al utilizar delivery ecológico vs. movilidad convencional a combustión.

* **Fórmula General:**
  $$AP = \begin{cases} 80 \times (d - 1.5) & \text{si } d > 1.5 \text{ km} \\ 0 & \text{si } d \le 1.5 \text{ km} \end{cases}$$
* **Regla MVP:** Como en la versión MVP la distancia se fija como constante $d = 1.5\text{ km}$, el ahorro de transporte por pedido es **$0.00\text{ g CO}_2$** ($1.5 - 1.5 = 0$).

### 4.2 Índice de Ahorro — Recipientes Biodegradables ($AUP$)
Mide el ahorro de $\text{CO}_2$ al reemplazar plásticos de un solo uso por utensilios biodegradables.

* **Fórmula General:**
  $$AUP = 50 \times (\text{vasos} + \text{platos} + \text{cubiertos})$$
* **Ejemplo de Cálculo:**
  $$\text{Pedido con 1 vaso, 1 plato, 2 cubiertos} \implies 50 \times (1 + 1 + 2) = 200\text{ g CO}_2 \text{ ahorrados}$$

### 4.3 Ahorro Total de Carbono por Usuario / Pedido
* **Fórmula:**
  $$\text{Ahorro Total CO}_2 = AP + AUP$$

---

## 5. Mapeo Completo entre DDL Relacional y Dataset CSV (`ecobite_dataset_kaggle.csv`)

| Campo en CSV | Entidad / Origen DDL | Columna / Lógica DDL | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `pedido_id` | `PEDIDO` | `PEDIDO.id` | `VARCHAR` / `UUID` | Identificador único del pedido. |
| `fecha_pedido` | `PEDIDO` | `PEDIDO.fecha` | `TIMESTAMP` | Fecha y hora del registro del pedido. |
| `estado_pedido` | `PEDIDO` | `PEDIDO.estado` | `VARCHAR` | Estado del pedido (`completado`, `cancelado`). |
| `monto_pedido` | `PEDIDO` | `PEDIDO.monto_total` | `DECIMAL(10,2)` | Importe total transaccionado en ARS. |
| `cliente_id` | `USUARIO` | `USUARIO.id` | `UUID` | ID único del cliente comprador. |
| `cliente_nombre` | `USUARIO` | `USUARIO.nombre` | `VARCHAR` | Nombre y apellido del cliente. |
| `restaurante_id` | `RESTAURANTE` | `RESTAURANTE.id` | `UUID` | ID único del restaurante. |
| `restaurante_nombre` | `RESTAURANTE` | `RESTAURANTE.nombre` | `VARCHAR` | Nombre comercial del comercio. |
| `restaurante_estado` | `RESTAURANTE` | `RESTAURANTE.estado` | `VARCHAR` | Condición del local (`activo`, `inactivo`). |
| `plato_nombre` | `PLATO` | `PLATO.nombre` | `VARCHAR` | Nombre del producto/menú consumido. |
| `cantidad` | `DETALLE_PEDIDO` | `DETALLE_PEDIDO.cantidad` | `INTEGER` | Cantidad de porciones/unidades solicitadas. |
| `cantidad_vasos` | `PLATO_RECIPIENTE` | `SUM(cantidad)` donde vaso | `INTEGER` | Unidades de vasos biodegradables incluidos. |
| `cantidad_platos` | `PLATO_RECIPIENTE` | `SUM(cantidad)` donde plato | `INTEGER` | Unidades de platos/contenedores biodegradables. |
| `cantidad_cubiertos` | `PLATO_RECIPIENTE` | `SUM(cantidad)` donde cubierto | `INTEGER` | Unidades de cubiertos biodegradables. |
| `cantidad_recipiente` | `PLATO_RECIPIENTE` | `SUM(cantidad)` recipiente base | `INTEGER` | Envase contenedor primario del plato. |
| `total_envases` | Calculado | `vasos + platos + cubiertos + recipiente` | `INTEGER` | Total general de unidades biodegradables entregadas. |
| `tipo_transporte` | `TIPOTRANSPORTE` | `TIPOTRANSPORTE.descripcion` | `VARCHAR` | Vehículo/método empleado en la entrega. |
| `distancia_km` | Paramétrico (MVP) | Constante $C_2 = 1.5$ | `DECIMAL(5,2)` | Distancia de la entrega en kilómetros. |
| `ahorro_co2_transporte_g`| Calculado | Fórmula $AP$ | `DECIMAL(10,2)` | CO₂ ahorrado por transporte ($80 \times (d - 1.5)$). |
| `ahorro_co2_recipientes_g`| Calculado | Fórmula $AUP$ | `DECIMAL(10,2)` | CO₂ ahorrado por envases ($50 \times (vasos + platos + cubiertos)$). |
| `ahorro_total_co2_g` | Calculado | $AP + AUP$ | `DECIMAL(10,2)` | Impacto ambiental positivo total (en gramos de CO₂). |
