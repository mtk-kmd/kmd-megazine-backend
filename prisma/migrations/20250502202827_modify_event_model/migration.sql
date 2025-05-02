/*
  Warnings:

  - You are about to drop the column `contribution_id` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_contribution_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "contribution_id",
ADD COLUMN     "faculty_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("faculty_id") ON DELETE SET NULL ON UPDATE CASCADE;
