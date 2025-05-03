/*
  Warnings:

  - You are about to drop the column `contribution_id` on the `StudentSubmission` table. All the data in the column will be lost.
  - You are about to drop the `Contribution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_closure_id_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_userUser_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentSubmission" DROP CONSTRAINT "StudentSubmission_contribution_id_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "facultyFaculty_id" INTEGER;

-- AlterTable
ALTER TABLE "StudentSubmission" DROP COLUMN "contribution_id",
ADD COLUMN     "event_id" INTEGER;

-- DropTable
DROP TABLE "Contribution";

-- CreateTable
CREATE TABLE "ViewCount" (
    "view_count_id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "ViewCount_pkey" PRIMARY KEY ("view_count_id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_facultyFaculty_id_fkey" FOREIGN KEY ("facultyFaculty_id") REFERENCES "Faculty"("faculty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewCount" ADD CONSTRAINT "ViewCount_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;
