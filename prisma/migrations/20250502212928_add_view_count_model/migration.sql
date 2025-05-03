-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "view_count_id" INTEGER;

-- CreateTable
CREATE TABLE "ViewCount" (
    "view_count_id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "ViewCount_pkey" PRIMARY KEY ("view_count_id")
);

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_view_count_id_fkey" FOREIGN KEY ("view_count_id") REFERENCES "ViewCount"("view_count_id") ON DELETE SET NULL ON UPDATE CASCADE;
