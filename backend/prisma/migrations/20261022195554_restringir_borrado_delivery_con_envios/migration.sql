-- DropForeignKey
ALTER TABLE "envio" DROP CONSTRAINT "envio_delivery_id_fkey";

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
