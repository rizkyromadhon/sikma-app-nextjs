/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_uid_key" ON "user"("uid");
