-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_semesterId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "semesterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
