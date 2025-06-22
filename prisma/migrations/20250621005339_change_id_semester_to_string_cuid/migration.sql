/*
  Warnings:

  - The primary key for the `Semester` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `semesterId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Golongan" DROP CONSTRAINT "Golongan_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "JadwalKuliah" DROP CONSTRAINT "JadwalKuliah_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_semesterId_fkey";

-- AlterTable
ALTER TABLE "Golongan" ALTER COLUMN "semesterId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JadwalKuliah" ALTER COLUMN "semesterId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Semester_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Semester_id_seq";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "semesterId" SET NOT NULL,
ALTER COLUMN "semesterId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKuliah" ADD CONSTRAINT "JadwalKuliah_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Golongan" ADD CONSTRAINT "Golongan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
