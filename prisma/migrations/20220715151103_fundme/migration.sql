/*
  Warnings:

  - Made the column `userId` on table `beneficiary` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderId` on table `paymentdetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalFund` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `beneficiary` DROP FOREIGN KEY `Beneficiary_userId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentdetails` DROP FOREIGN KEY `PaymentDetails_senderId_fkey`;

-- AlterTable
ALTER TABLE `beneficiary` MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `paymentdetails` MODIFY `senderId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `totalFund` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PaymentDetails` ADD CONSTRAINT `PaymentDetails_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Beneficiary` ADD CONSTRAINT `Beneficiary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
