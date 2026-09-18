-- CreateEnum
CREATE TYPE "TshirtModel" AS ENUM ('BLANCA', 'NEGRA', 'FUTBOL');

-- CreateEnum
CREATE TYPE "DtfVariant" AS ENUM ('UNICO', 'BLANCO', 'NEGRO');

-- CreateTable
CREATE TABLE "TshirtStock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "model" "TshirtModel" NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TshirtStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DtfStock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" "DtfVariant" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DtfStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TshirtStock_userId_idx" ON "TshirtStock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TshirtStock_userId_model_size_key" ON "TshirtStock"("userId", "model", "size");

-- CreateIndex
CREATE INDEX "DtfStock_userId_idx" ON "DtfStock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DtfStock_userId_name_variant_key" ON "DtfStock"("userId", "name", "variant");

-- AddForeignKey
ALTER TABLE "TshirtStock" ADD CONSTRAINT "TshirtStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DtfStock" ADD CONSTRAINT "DtfStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
