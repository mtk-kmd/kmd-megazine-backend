/*
  Warnings:

  - The values [PENDING,SELECTED,REJECTED] on the enum `ContributionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contribution_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `agreed_to_terms` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `upload_url` on the `Contribution` table. All the data in the column will be lost.
  - Added the required column `submission_id` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContributionStatus_new" AS ENUM ('OPEN', 'CLOSED', 'FINALIZED');
ALTER TABLE "Contribution" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Contribution" ALTER COLUMN "status" TYPE "ContributionStatus_new" USING ("status"::text::"ContributionStatus_new");
ALTER TYPE "ContributionStatus" RENAME TO "ContributionStatus_old";
ALTER TYPE "ContributionStatus_new" RENAME TO "ContributionStatus";
DROP TYPE "ContributionStatus_old";
ALTER TABLE "Contribution" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_contribution_id_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_student_id_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "contribution_id",
ADD COLUMN     "submission_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "agreed_to_terms",
DROP COLUMN "content",
DROP COLUMN "student_id",
DROP COLUMN "submittedAt",
DROP COLUMN "upload_url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "userUser_id" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "StudentSubmission" (
    "submission_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "contribution_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "agreed_to_terms" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubmission_pkey" PRIMARY KEY ("submission_id")
);

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userUser_id_fkey" FOREIGN KEY ("userUser_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "Contribution"("contribution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "StudentSubmission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
