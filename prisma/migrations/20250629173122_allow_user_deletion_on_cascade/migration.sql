-- DropForeignKey
ALTER TABLE "JadwalKuliah" DROP CONSTRAINT "JadwalKuliah_dosenId_fkey";

-- DropForeignKey
ALTER TABLE "LaporanMahasiswa" DROP CONSTRAINT "LaporanMahasiswa_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notifikasi" DROP CONSTRAINT "Notifikasi_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Notifikasi" DROP CONSTRAINT "Notifikasi_userId_fkey";

-- DropForeignKey
ALTER TABLE "PengajuanIzin" DROP CONSTRAINT "PengajuanIzin_mahasiswaId_fkey";

-- DropForeignKey
ALTER TABLE "PesertaKuliah" DROP CONSTRAINT "PesertaKuliah_mahasiswaId_fkey";

-- DropForeignKey
ALTER TABLE "PresensiKuliah" DROP CONSTRAINT "PresensiKuliah_mahasiswaId_fkey";

-- AlterTable
ALTER TABLE "JadwalKuliah" ALTER COLUMN "dosenId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PresensiKuliah" ADD CONSTRAINT "PresensiKuliah_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanIzin" ADD CONSTRAINT "PengajuanIzin_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanMahasiswa" ADD CONSTRAINT "LaporanMahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaKuliah" ADD CONSTRAINT "PesertaKuliah_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
