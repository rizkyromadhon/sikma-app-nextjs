/*
  Warnings:

  - You are about to drop the column `golonganId` on the `JadwalKuliah` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JadwalKuliah" DROP CONSTRAINT "JadwalKuliah_golonganId_fkey";

-- AlterTable
ALTER TABLE "JadwalKuliah" DROP COLUMN "golonganId";

-- CreateTable
CREATE TABLE "_GolonganToJadwalKuliah" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GolonganToJadwalKuliah_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GolonganToJadwalKuliah_B_index" ON "_GolonganToJadwalKuliah"("B");

-- AddForeignKey
ALTER TABLE "_GolonganToJadwalKuliah" ADD CONSTRAINT "_GolonganToJadwalKuliah_A_fkey" FOREIGN KEY ("A") REFERENCES "Golongan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GolonganToJadwalKuliah" ADD CONSTRAINT "_GolonganToJadwalKuliah_B_fkey" FOREIGN KEY ("B") REFERENCES "JadwalKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
