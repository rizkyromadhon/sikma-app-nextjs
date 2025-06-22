/*
  Warnings:

  - The `mode` column on the `AlatPresensi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `AlatPresensi` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AlatMode" AS ENUM ('MASUK', 'PULANG', 'PRESENSI', 'REGISTRASI');

-- CreateEnum
CREATE TYPE "AlatStatus" AS ENUM ('AKTIF', 'NONAKTIF', 'ERROR');

-- AlterTable
ALTER TABLE "AlatPresensi" DROP COLUMN "mode",
ADD COLUMN     "mode" "AlatMode" NOT NULL DEFAULT 'PRESENSI',
DROP COLUMN "status",
ADD COLUMN     "status" "AlatStatus" NOT NULL DEFAULT 'NONAKTIF';
