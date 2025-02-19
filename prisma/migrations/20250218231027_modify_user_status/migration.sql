/*
  Warnings:

  - Added the required column `auth_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Authentication"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;
