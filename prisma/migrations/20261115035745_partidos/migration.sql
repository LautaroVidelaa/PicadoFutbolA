-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_awayTeamId_fkey`;

-- AlterTable
ALTER TABLE `match` ADD COLUMN `awayName` VARCHAR(191) NULL,
    MODIFY `awayTeamId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_awayTeamId_fkey` FOREIGN KEY (`awayTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
