-- CreateTable
CREATE TABLE "Event" (
    "event_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contribution_content_upload_url" TEXT[],
    "status" "ContributionStatus" NOT NULL DEFAULT 'OPEN',
    "allowPublication" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userUser_id" INTEGER,
    "closure_id" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userUser_id_fkey" FOREIGN KEY ("userUser_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_closure_id_fkey" FOREIGN KEY ("closure_id") REFERENCES "ClosureDate"("closure_id") ON DELETE SET NULL ON UPDATE CASCADE;
