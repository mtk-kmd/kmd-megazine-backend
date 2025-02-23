/*
  Warnings:

  - You are about to drop the column `images` on the `StudentSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "contribution_content_upload_url" TEXT[];

-- AlterTable
ALTER TABLE "StudentSubmission" DROP COLUMN "images",
ADD COLUMN     "uploadUrl" TEXT[];
