-- AlterTable
ALTER TABLE "user" ADD COLUMN     "semesterId" INTEGER;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
