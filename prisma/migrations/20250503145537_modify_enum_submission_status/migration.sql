/*
  Warnings:

  - The values [ACCEPT,REJECT] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubmissionStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "StudentSubmission" ALTER COLUMN "submission_status" DROP DEFAULT;
ALTER TABLE "StudentSubmission" ALTER COLUMN "submission_status" TYPE "SubmissionStatus_new" USING ("submission_status"::text::"SubmissionStatus_new");
ALTER TYPE "SubmissionStatus" RENAME TO "SubmissionStatus_old";
ALTER TYPE "SubmissionStatus_new" RENAME TO "SubmissionStatus";
DROP TYPE "SubmissionStatus_old";
ALTER TABLE "StudentSubmission" ALTER COLUMN "submission_status" SET DEFAULT 'PENDING';
COMMIT;
