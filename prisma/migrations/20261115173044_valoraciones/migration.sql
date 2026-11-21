-- CreateTable
CREATE TABLE `PlayerRating` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `raterId` VARCHAR(191) NOT NULL,
    `ratedId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `traits` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlayerRating_ratedId_idx`(`ratedId`),
    INDEX `PlayerRating_matchId_idx`(`matchId`),
    UNIQUE INDEX `PlayerRating_matchId_raterId_ratedId_key`(`matchId`, `raterId`, `ratedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerRating` ADD CONSTRAINT `PlayerRating_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerRating` ADD CONSTRAINT `PlayerRating_raterId_fkey` FOREIGN KEY (`raterId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerRating` ADD CONSTRAINT `PlayerRating_ratedId_fkey` FOREIGN KEY (`ratedId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
