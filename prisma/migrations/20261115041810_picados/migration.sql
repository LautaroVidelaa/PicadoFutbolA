-- DropForeignKey
ALTER TABLE `goal` DROP FOREIGN KEY `Goal_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `match` DROP FOREIGN KEY `Match_homeTeamId_fkey`;

-- AlterTable
ALTER TABLE `goal` ADD COLUMN `side` ENUM('HOME', 'AWAY') NOT NULL DEFAULT 'HOME',
    MODIFY `teamId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `match` ADD COLUMN `homeName` VARCHAR(191) NULL,
    MODIFY `homeTeamId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `matchplayer` MODIFY `side` ENUM('HOME', 'AWAY') NULL;

-- AlterTable
ALTER TABLE `player` ADD COLUMN `discoverable` BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_homeTeamId_fkey` FOREIGN KEY (`homeTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
