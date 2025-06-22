/*
  Warnings:

  - Added the required column `semesterId` to the `Golongan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Golongan" ADD COLUMN     "semesterId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Golongan" ADD CONSTRAINT "Golongan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
