/*
  Warnings:

  - You are about to drop the column `recievedBy` on the `accounthistory` table. All the data in the column will be lost.
  - You are about to drop the column `sentTo` on the `accounthistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accounthistory` DROP COLUMN `recievedBy`,
    DROP COLUMN `sentTo`,
    ADD COLUMN `sentBy` VARCHAR(191) NULL;
