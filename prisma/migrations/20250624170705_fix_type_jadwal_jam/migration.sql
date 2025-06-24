-- DropForeignKey
ALTER TABLE "PesertaKuliah" DROP CONSTRAINT "PesertaKuliah_jadwalKuliahId_fkey";

-- AlterTable
ALTER TABLE "JadwalKuliah" ALTER COLUMN "jam_mulai" SET DATA TYPE TEXT,
ALTER COLUMN "jam_selesai" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "PesertaKuliah" ADD CONSTRAINT "PesertaKuliah_jadwalKuliahId_fkey" FOREIGN KEY ("jadwalKuliahId") REFERENCES "JadwalKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
