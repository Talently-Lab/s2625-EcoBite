-- AlterTable
ALTER TABLE "restaurante" ADD COLUMN     "calificacionPromedio" DECIMAL(2,1),
ADD COLUMN     "ceroResiduos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "envioVerde" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recomendado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalValoraciones" INTEGER NOT NULL DEFAULT 0;
