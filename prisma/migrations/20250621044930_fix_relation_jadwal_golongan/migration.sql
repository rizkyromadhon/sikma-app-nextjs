/*
  Warnings:

  - You are about to drop the `_GolonganToJadwalKuliah` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GolonganToJadwalKuliah" DROP CONSTRAINT "_GolonganToJadwalKuliah_A_fkey";

-- DropForeignKey
ALTER TABLE "_GolonganToJadwalKuliah" DROP CONSTRAINT "_GolonganToJadwalKuliah_B_fkey";

-- DropTable
DROP TABLE "_GolonganToJadwalKuliah";

-- CreateTable
CREATE TABLE "_JadwalToGolongan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JadwalToGolongan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JadwalToGolongan_B_index" ON "_JadwalToGolongan"("B");

-- AddForeignKey
ALTER TABLE "_JadwalToGolongan" ADD CONSTRAINT "_JadwalToGolongan_A_fkey" FOREIGN KEY ("A") REFERENCES "Golongan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JadwalToGolongan" ADD CONSTRAINT "_JadwalToGolongan_B_fkey" FOREIGN KEY ("B") REFERENCES "JadwalKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
