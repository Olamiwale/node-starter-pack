-- CreateTable
CREATE TABLE "AccountVerificationToken" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountVerificationToken_token_key" ON "AccountVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AccountVerificationToken_accountId_key" ON "AccountVerificationToken"("accountId");

-- AddForeignKey
ALTER TABLE "AccountVerificationToken" ADD CONSTRAINT "AccountVerificationToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
