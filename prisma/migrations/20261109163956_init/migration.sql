-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `claimCode` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `photoUrl` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `position` ENUM('GK', 'DEF', 'MID', 'FWD') NULL,
    `number` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Player_userId_key`(`userId`),
    UNIQUE INDEX `Player_claimCode_key`(`claimCode`),
    INDEX `Player_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `crestUrl` VARCHAR(191) NULL,
    `photoUrl` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'LINK', 'PRIVATE') NOT NULL DEFAULT 'LINK',
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Team_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `role` ENUM('REGULAR', 'GUEST') NOT NULL DEFAULT 'REGULAR',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,

    INDEX `TeamMember_playerId_idx`(`playerId`),
    UNIQUE INDEX `TeamMember_teamId_playerId_key`(`teamId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` VARCHAR(191) NOT NULL,
    `shareCode` VARCHAR(191) NOT NULL,
    `playersPerSide` INTEGER NOT NULL,
    `homeTeamId` VARCHAR(191) NOT NULL,
    `awayTeamId` VARCHAR(191) NOT NULL,
    `playedAt` DATETIME(3) NOT NULL,
    `venue` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'LINK', 'PRIVATE') NOT NULL DEFAULT 'LINK',
    `status` ENUM('SCHEDULED', 'FINISHED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `homeScore` INTEGER NULL,
    `awayScore` INTEGER NULL,
    `homeFormation` VARCHAR(191) NULL,
    `awayFormation` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Match_shareCode_key`(`shareCode`),
    INDEX `Match_homeTeamId_idx`(`homeTeamId`),
    INDEX `Match_awayTeamId_idx`(`awayTeamId`),
    INDEX `Match_createdById_idx`(`createdById`),
    INDEX `Match_playedAt_idx`(`playedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchPlayer` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `side` ENUM('HOME', 'AWAY') NOT NULL,
    `attendance` ENUM('PENDING', 'CONFIRMED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `posX` DOUBLE NULL,
    `posY` DOUBLE NULL,

    INDEX `MatchPlayer_playerId_idx`(`playerId`),
    UNIQUE INDEX `MatchPlayer_matchId_playerId_key`(`matchId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `scorerId` VARCHAR(191) NOT NULL,
    `assisterId` VARCHAR(191) NULL,
    `minute` INTEGER NULL,
    `ownGoal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Goal_matchId_idx`(`matchId`),
    INDEX `Goal_scorerId_idx`(`scorerId`),
    INDEX `Goal_assisterId_idx`(`assisterId`),
    INDEX `Goal_teamId_idx`(`teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_homeTeamId_fkey` FOREIGN KEY (`homeTeamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_awayTeamId_fkey` FOREIGN KEY (`awayTeamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchPlayer` ADD CONSTRAINT `MatchPlayer_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchPlayer` ADD CONSTRAINT `MatchPlayer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_scorerId_fkey` FOREIGN KEY (`scorerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_assisterId_fkey` FOREIGN KEY (`assisterId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
