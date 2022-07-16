/*
  Warnings:

  - The primary key for the `beneficiary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `totalFund` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `paymentdetails` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `beneficiaryId` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `paymentdetails` DROP FOREIGN KEY `PaymentDetails_senderId_fkey`;

-- AlterTable
ALTER TABLE `beneficiary` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `beneficiaryId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`beneficiaryId`);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `totalFund`;

-- DropTable
DROP TABLE `paymentdetails`;

-- CreateTable
CREATE TABLE `Account` (
    `accountId` INTEGER NOT NULL AUTO_INCREMENT,
    `totalFund` INTEGER NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Account_userId_key`(`userId`),
    PRIMARY KEY (`accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountHistory` (
    `historyId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `sentTo` VARCHAR(191) NULL,
    `recievedBy` VARCHAR(191) NULL,
    `accountId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`historyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountHistory` ADD CONSTRAINT `AccountHistory_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;
