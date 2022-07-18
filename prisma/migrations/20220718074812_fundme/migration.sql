/*
  Warnings:

  - You are about to drop the column `totalFund` on the `account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `totalFund`,
    ADD COLUMN `totalFunds` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `accounthistory` ADD COLUMN `reference` VARCHAR(191) NULL;
