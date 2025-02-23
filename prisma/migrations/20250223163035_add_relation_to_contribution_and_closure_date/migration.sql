-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "closure_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_closure_id_fkey" FOREIGN KEY ("closure_id") REFERENCES "ClosureDate"("closure_id") ON DELETE SET NULL ON UPDATE CASCADE;
