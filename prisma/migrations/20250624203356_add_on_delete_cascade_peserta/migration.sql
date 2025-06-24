-- DropForeignKey
ALTER TABLE "PresensiKuliah" DROP CONSTRAINT "PresensiKuliah_jadwalKuliahId_fkey";

-- AddForeignKey
ALTER TABLE "PresensiKuliah" ADD CONSTRAINT "PresensiKuliah_jadwalKuliahId_fkey" FOREIGN KEY ("jadwalKuliahId") REFERENCES "JadwalKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
