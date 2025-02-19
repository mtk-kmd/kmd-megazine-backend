-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_auth_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "auth_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Authentication"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;
