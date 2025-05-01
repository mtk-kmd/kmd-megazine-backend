/*
  Warnings:

  - You are about to drop the `GuestUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GuestUser" DROP CONSTRAINT "GuestUser_auth_id_fkey";

-- DropForeignKey
ALTER TABLE "GuestUser" DROP CONSTRAINT "GuestUser_role_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "guest_faculty_id" INTEGER;

-- DropTable
DROP TABLE "GuestUser";

-- CreateTable
CREATE TABLE "GuestFaculty" (
    "guest_faculty_id" SERIAL NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,

    CONSTRAINT "GuestFaculty_pkey" PRIMARY KEY ("guest_faculty_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestFaculty_guest_id_key" ON "GuestFaculty"("guest_id");

-- AddForeignKey
ALTER TABLE "GuestFaculty" ADD CONSTRAINT "GuestFaculty_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestFaculty" ADD CONSTRAINT "GuestFaculty_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;
