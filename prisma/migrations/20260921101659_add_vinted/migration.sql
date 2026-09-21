-- CreateEnum
CREATE TYPE "VintedType" AS ENUM ('COMPRA', 'VENTA');

-- CreateTable
CREATE TABLE "VintedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VintedType" NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expenseId" TEXT,
    "incomeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VintedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VintedItem_expenseId_key" ON "VintedItem"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "VintedItem_incomeId_key" ON "VintedItem"("incomeId");

-- CreateIndex
CREATE INDEX "VintedItem_userId_type_idx" ON "VintedItem"("userId", "type");

-- AddForeignKey
ALTER TABLE "VintedItem" ADD CONSTRAINT "VintedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VintedItem" ADD CONSTRAINT "VintedItem_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VintedItem" ADD CONSTRAINT "VintedItem_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "Income"("id") ON DELETE CASCADE ON UPDATE CASCADE;
