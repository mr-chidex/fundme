/*
  Warnings:

  - A unique constraint covering the columns `[beneficiaryId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `beneficiaryId` INTEGER NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `totalFund` INTEGER NULL;

-- CreateTable
CREATE TABLE `PaymentDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `paidBy` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `senderId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_beneficiaryId_key` ON `User`(`beneficiaryId`);

-- AddForeignKey
ALTER TABLE `PaymentDetails` ADD CONSTRAINT `PaymentDetails_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_beneficiaryId_fkey` FOREIGN KEY (`beneficiaryId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
