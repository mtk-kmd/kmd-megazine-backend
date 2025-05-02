-- CreateTable
CREATE TABLE "browserTracking" (
    "id" SERIAL NOT NULL,
    "browser_name" TEXT NOT NULL,
    "browser_version" TEXT,
    "os_name" TEXT NOT NULL,
    "os_version" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "device_vendor" TEXT NOT NULL,
    "device_model" TEXT NOT NULL,
    "request_path" TEXT NOT NULL,
    "request_method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,

    CONSTRAINT "browserTracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "browserTracking" ADD CONSTRAINT "browserTracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
