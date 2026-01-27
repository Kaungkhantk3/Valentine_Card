-- CreateTable
CREATE TABLE `CardPhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardId` INTEGER NOT NULL,
    `frameIndex` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `x` DOUBLE NOT NULL DEFAULT 0,
    `y` DOUBLE NOT NULL DEFAULT 0,
    `scale` DOUBLE NOT NULL DEFAULT 1,
    `rotate` DOUBLE NOT NULL DEFAULT 0,
    `shape` VARCHAR(16) NOT NULL DEFAULT 'heart',

    INDEX `CardPhoto_cardId_idx`(`cardId`),
    UNIQUE INDEX `CardPhoto_cardId_frameIndex_key`(`cardId`, `frameIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CardPhoto` ADD CONSTRAINT `CardPhoto_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
