-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "contribution_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "Contribution"("contribution_id") ON DELETE SET NULL ON UPDATE CASCADE;
