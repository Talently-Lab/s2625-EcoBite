-- AlterTable
ALTER TABLE "plato" ADD COLUMN     "imagen_url" VARCHAR(500);

-- AlterTable
ALTER TABLE "restaurante" ADD COLUMN     "imagen_url" VARCHAR(500);

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "imagen_url" VARCHAR(500),
ADD COLUMN     "restaurante_id" UUID;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
