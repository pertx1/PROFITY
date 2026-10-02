-- CreateTable
CREATE TABLE "ShirtDtfRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shirtColor" TEXT NOT NULL,
    "shirtColorKey" TEXT NOT NULL,
    "dtfColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShirtDtfRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignDtfRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "design" TEXT NOT NULL,
    "dtfColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignDtfRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintBagCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintBagCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShirtDtfRule_userId_shirtColorKey_key" ON "ShirtDtfRule"("userId", "shirtColorKey");

-- CreateIndex
CREATE UNIQUE INDEX "DesignDtfRule_userId_design_key" ON "DesignDtfRule"("userId", "design");

-- CreateIndex
CREATE UNIQUE INDEX "PrintBagCheck_userId_key_key" ON "PrintBagCheck"("userId", "key");

-- AddForeignKey
ALTER TABLE "ShirtDtfRule" ADD CONSTRAINT "ShirtDtfRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignDtfRule" ADD CONSTRAINT "DesignDtfRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintBagCheck" ADD CONSTRAINT "PrintBagCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
