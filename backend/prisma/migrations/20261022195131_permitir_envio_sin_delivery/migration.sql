-- DropForeignKey
ALTER TABLE "envio" DROP CONSTRAINT "envio_delivery_id_fkey";

-- AlterTable
ALTER TABLE "envio" ALTER COLUMN "delivery_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
