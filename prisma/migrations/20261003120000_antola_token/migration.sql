-- AlterTable
ALTER TABLE "User" ADD COLUMN "antolaTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN "antolaTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_antolaTokenHash_key" ON "User"("antolaTokenHash");
