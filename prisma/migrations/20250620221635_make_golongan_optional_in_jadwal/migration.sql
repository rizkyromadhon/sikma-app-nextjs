-- DropForeignKey
ALTER TABLE "JadwalKuliah" DROP CONSTRAINT "JadwalKuliah_golonganId_fkey";

-- AlterTable
ALTER TABLE "JadwalKuliah" ALTER COLUMN "golonganId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProgramStudi" ALTER COLUMN "slug" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_golonganId_fkey" FOREIGN KEY ("golonganId") REFERENCES "Golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
