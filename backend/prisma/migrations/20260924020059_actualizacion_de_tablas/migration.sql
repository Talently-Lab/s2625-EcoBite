/*
  Warnings:

  - You are about to drop the `delivery_restaurante_pedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "delivery_restaurante_pedido" DROP CONSTRAINT "delivery_restaurante_pedido_delivery_restaurante_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_restaurante_pedido" DROP CONSTRAINT "delivery_restaurante_pedido_pedido_id_fkey";

-- DropTable
DROP TABLE "delivery_restaurante_pedido";
