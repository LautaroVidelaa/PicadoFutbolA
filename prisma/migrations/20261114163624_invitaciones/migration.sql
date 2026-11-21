/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `team` ADD COLUMN `inviteCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Team_inviteCode_key` ON `Team`(`inviteCode`);
