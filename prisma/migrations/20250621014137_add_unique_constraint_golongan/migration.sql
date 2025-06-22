/*
  Warnings:

  - A unique constraint covering the columns `[prodiId,semesterId,name]` on the table `Golongan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Golongan_prodiId_semesterId_name_key" ON "Golongan"("prodiId", "semesterId", "name");
