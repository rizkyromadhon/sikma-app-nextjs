-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOSEN', 'MAHASISWA');

-- CreateEnum
CREATE TYPE "SemesterType" AS ENUM ('GANJIL', 'GENAP');

-- CreateEnum
CREATE TYPE "RuanganType" AS ENUM ('TEORI', 'PRAKTIKUM');

-- CreateEnum
CREATE TYPE "Hari" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU');

-- CreateEnum
CREATE TYPE "StatusPresensi" AS ENUM ('HADIR', 'TIDAK_HADIR', 'IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "TipePengajuan" AS ENUM ('IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('DIPROSES', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "uid" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "alamat" TEXT,
    "no_hp" TEXT,
    "foto" TEXT,
    "nim" TEXT,
    "nip" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'MAHASISWA',
    "gender" TEXT,
    "prodiId" TEXT,
    "golonganId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tipe" "SemesterType" NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruangan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RuanganType" NOT NULL,

    CONSTRAINT "Ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramStudi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "ProgramStudi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresensiKuliah" (
    "id" TEXT NOT NULL,
    "waktu_presensi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPresensi" NOT NULL,
    "keterangan" TEXT,
    "mahasiswaId" TEXT NOT NULL,
    "matkulId" TEXT NOT NULL,
    "jadwalKuliahId" TEXT NOT NULL,

    CONSTRAINT "PresensiKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanIzin" (
    "id" TEXT NOT NULL,
    "tanggal_izin" TIMESTAMP(3) NOT NULL,
    "tipe_pengajuan" "TipePengajuan" NOT NULL,
    "pesan" TEXT NOT NULL,
    "file_bukti" TEXT,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'DIPROSES',
    "catatan_dosen" TEXT,
    "mahasiswaId" TEXT NOT NULL,
    "jadwalKuliahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengajuanIzin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "url_tujuan" TEXT,
    "read_at" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanMahasiswa" (
    "id" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Belum Ditangani',
    "balasan" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanMahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalKuliah" (
    "id" TEXT NOT NULL,
    "is_kelas_besar" BOOLEAN NOT NULL DEFAULT false,
    "hari" "Hari" NOT NULL,
    "jam_mulai" TIMESTAMP(3) NOT NULL,
    "jam_selesai" TIMESTAMP(3) NOT NULL,
    "dosenId" TEXT NOT NULL,
    "matkulId" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "prodiId" TEXT NOT NULL,
    "golonganId" TEXT NOT NULL,
    "ruanganId" TEXT NOT NULL,

    CONSTRAINT "JadwalKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Golongan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "Golongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlatPresensi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "jadwal_nyala" TIMESTAMP(3),
    "jadwal_mati" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "ruanganId" TEXT NOT NULL,

    CONSTRAINT "AlatPresensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesertaKuliah" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "jadwalKuliahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PesertaKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_uid_key" ON "user"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_nim_key" ON "user"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "user_nip_key" ON "user"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_name_key" ON "Semester"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ruangan_kode_key" ON "Ruangan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramStudi_name_key" ON "ProgramStudi"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramStudi_slug_key" ON "ProgramStudi"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "PesertaKuliah_mahasiswaId_jadwalKuliahId_key" ON "PesertaKuliah"("mahasiswaId", "jadwalKuliahId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "ProgramStudi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_golonganId_fkey" FOREIGN KEY ("golonganId") REFERENCES "Golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiKuliah" ADD CONSTRAINT "PresensiKuliah_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiKuliah" ADD CONSTRAINT "PresensiKuliah_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresensiKuliah" ADD CONSTRAINT "PresensiKuliah_jadwalKuliahId_fkey" FOREIGN KEY ("jadwalKuliahId") REFERENCES "JadwalKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanIzin" ADD CONSTRAINT "PengajuanIzin_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanIzin" ADD CONSTRAINT "PengajuanIzin_jadwalKuliahId_fkey" FOREIGN KEY ("jadwalKuliahId") REFERENCES "JadwalKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanMahasiswa" ADD CONSTRAINT "LaporanMahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_matkulId_fkey" FOREIGN KEY ("matkulId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_golonganId_fkey" FOREIGN KEY ("golonganId") REFERENCES "Golongan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "Ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Golongan" ADD CONSTRAINT "Golongan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "ProgramStudi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlatPresensi" ADD CONSTRAINT "AlatPresensi_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "Ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaKuliah" ADD CONSTRAINT "PesertaKuliah_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesertaKuliah" ADD CONSTRAINT "PesertaKuliah_jadwalKuliahId_fkey" FOREIGN KEY ("jadwalKuliahId") REFERENCES "JadwalKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
