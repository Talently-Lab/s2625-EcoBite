-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "analytics";

-- CreateTable
CREATE TABLE "analytics"."eventos" (
    "id" UUID NOT NULL,
    "nombre_evento" VARCHAR(100) NOT NULL,
    "rol_usuario" VARCHAR(100) NOT NULL,
    "usuario_id" UUID,
    "session_id" UUID NOT NULL,
    "fecha_cliente" TIMESTAMPTZ(3) NOT NULL,
    "fecha_recepcion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propiedades" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_session_id_fecha_cliente_idx" ON "analytics"."eventos"("session_id", "fecha_cliente");

-- CreateIndex
CREATE INDEX "eventos_nombre_evento_rol_usuario_fecha_recepcion_idx" ON "analytics"."eventos"("nombre_evento", "rol_usuario", "fecha_recepcion");
