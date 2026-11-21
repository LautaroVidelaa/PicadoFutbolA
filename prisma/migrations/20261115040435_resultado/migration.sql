-- AlterTable
ALTER TABLE `match` ADD COLUMN `mvpId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Match_mvpId_idx` ON `Match`(`mvpId`);

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_mvpId_fkey` FOREIGN KEY (`mvpId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
