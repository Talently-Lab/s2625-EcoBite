-- CreateEnum
CREATE TYPE "NivelAcceso" AS ENUM ('propio', 'restaurante', 'global', 'delivery');

-- CreateEnum
CREATE TYPE "EstadoRestaurante" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'confirmado', 'preparando', 'listo', 'en_transito', 'entregado', 'completado');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('pendiente', 'en_transito', 'entregado');

-- CreateTable
CREATE TABLE "tipo_usuario" (
    "id" UUID NOT NULL,
    "nombre_rol" VARCHAR(100) NOT NULL,
    "nivel_acceso" "NivelAcceso" NOT NULL,

    CONSTRAINT "tipo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,
    "tipo_usuario_id" UUID NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipotransporte" (
    "id" UUID NOT NULL,
    "descripcion" VARCHAR(20) NOT NULL,

    CONSTRAINT "tipotransporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo_transporte_id" UUID NOT NULL,

    CONSTRAINT "delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurante" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "domicilio" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "estado" "EstadoRestaurante" NOT NULL DEFAULT 'activo',

    CONSTRAINT "restaurante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_restaurante" (
    "id" UUID NOT NULL,
    "delivery_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,

    CONSTRAINT "delivery_restaurante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plato" (
    "id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "cantidad_vasos" INTEGER DEFAULT 0,
    "cantidad_platos" INTEGER DEFAULT 0,
    "cantidad_cubiertos" INTEGER DEFAULT 0,
    "cantidad_recipiente" INTEGER DEFAULT 0,

    CONSTRAINT "plato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "monto_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_restaurante_pedido" (
    "id" UUID NOT NULL,
    "delivery_restaurante_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "acepta" BOOLEAN NOT NULL DEFAULT false,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_restaurante_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itempedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "plato_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itempedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_id" UUID NOT NULL,
    "distancia_km" DECIMAL(5,2) NOT NULL DEFAULT 1.50,
    "restaurante_id" UUID NOT NULL,
    "domicilio_destino" VARCHAR(500) NOT NULL,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_usuario_nombre_rol_key" ON "tipo_usuario"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipotransporte_descripcion_key" ON "tipotransporte"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_usuario_id_key" ON "delivery"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurante_email_key" ON "restaurante"("email");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_restaurante_delivery_id_restaurante_id_key" ON "delivery_restaurante"("delivery_id", "restaurante_id");

-- CreateIndex
CREATE INDEX "idx_pedido_fecha_estado" ON "pedido"("fecha", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "envio_pedido_id_key" ON "envio"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_envio_fecha_delivery" ON "envio"("fecha_envio", "delivery_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_tipo_usuario_id_fkey" FOREIGN KEY ("tipo_usuario_id") REFERENCES "tipo_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_tipo_transporte_id_fkey" FOREIGN KEY ("tipo_transporte_id") REFERENCES "tipotransporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_restaurante" ADD CONSTRAINT "delivery_restaurante_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_restaurante" ADD CONSTRAINT "delivery_restaurante_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plato" ADD CONSTRAINT "plato_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_restaurante_pedido" ADD CONSTRAINT "delivery_restaurante_pedido_delivery_restaurante_id_fkey" FOREIGN KEY ("delivery_restaurante_id") REFERENCES "delivery_restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_restaurante_pedido" ADD CONSTRAINT "delivery_restaurante_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itempedido" ADD CONSTRAINT "itempedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itempedido" ADD CONSTRAINT "itempedido_plato_id_fkey" FOREIGN KEY ("plato_id") REFERENCES "plato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "itempedido" ADD CONSTRAINT "itempedido_cantidad_check" CHECK ("cantidad" > 0);