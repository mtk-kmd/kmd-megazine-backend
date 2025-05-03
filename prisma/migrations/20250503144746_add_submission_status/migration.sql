-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPT', 'REJECT');

-- AlterTable
ALTER TABLE "StudentSubmission" ADD COLUMN     "submission_status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';
