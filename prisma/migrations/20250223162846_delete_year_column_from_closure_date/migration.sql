/*
  Warnings:

  - You are about to drop the column `year` on the `ClosureDate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ClosureDate_year_key";

-- AlterTable
ALTER TABLE "ClosureDate" DROP COLUMN "year";
