-- DropIndex
DROP INDEX "analytics"."eventos_nombre_evento_rol_usuario_fecha_recepcion_idx";

-- DropIndex
DROP INDEX "analytics"."eventos_session_id_fecha_cliente_idx";

-- CreateIndex
CREATE INDEX "eventos_nombre_evento_fecha_recepcion_idx" ON "analytics"."eventos"("nombre_evento", "fecha_recepcion");

-- CreateIndex
CREATE INDEX "eventos_session_id_idx" ON "analytics"."eventos"("session_id");

-- Restringe los perfiles analíticos permitidos.
ALTER TABLE "analytics"."eventos"
ADD CONSTRAINT "eventos_rol_usuario_check"
CHECK (
    "rol_usuario" IN (
        'cliente',
        'gerente_restaurante',
        'admin',
        'delivery'
    )
);