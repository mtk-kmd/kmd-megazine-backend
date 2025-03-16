/*
  Warnings:

  - You are about to drop the column `faculty_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `student_faculty_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "faculty_id",
DROP COLUMN "student_faculty_id";
