/*
  Warnings:

  - Added the required column `categoria_comida` to the `restaurante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoriaComida" AS ENUM ('vegano', 'vegetariano', 'sin_tacc', 'comida_saludable', 'comida_rapida');

-- AlterTable
ALTER TABLE "restaurante" ADD COLUMN     "categoria_comida" "CategoriaComida" NOT NULL;
