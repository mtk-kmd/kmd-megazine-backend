-- AlterTable
ALTER TABLE "GuestUser" ADD COLUMN     "auth_id" INTEGER,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "GuestUser" ADD CONSTRAINT "GuestUser_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Authentication"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;
