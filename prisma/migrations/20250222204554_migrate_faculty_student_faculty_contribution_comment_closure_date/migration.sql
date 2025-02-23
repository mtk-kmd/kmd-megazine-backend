-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'SELECTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Faculty" (
    "faculty_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coordinator_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("faculty_id")
);

-- CreateTable
CREATE TABLE "StudentFaculty" (
    "student_faculty_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,

    CONSTRAINT "StudentFaculty_pkey" PRIMARY KEY ("student_faculty_id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "contribution_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "upload_url" TEXT[],
    "agreed_to_terms" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("contribution_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contribution_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "ClosureDate" (
    "closure_id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "entry_closure" TIMESTAMP(3) NOT NULL,
    "final_closure" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosureDate_pkey" PRIMARY KEY ("closure_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_coordinator_id_key" ON "Faculty"("coordinator_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFaculty_student_id_key" ON "StudentFaculty"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClosureDate_year_key" ON "ClosureDate"("year");

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFaculty" ADD CONSTRAINT "StudentFaculty_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFaculty" ADD CONSTRAINT "StudentFaculty_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("faculty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "Contribution"("contribution_id") ON DELETE RESTRICT ON UPDATE CASCADE;
