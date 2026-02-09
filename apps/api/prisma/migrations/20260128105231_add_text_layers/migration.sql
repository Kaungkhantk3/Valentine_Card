-- CreateTable
CREATE TABLE `CardTextLayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardId` INTEGER NOT NULL,
    `content` VARCHAR(200) NOT NULL,
    `color` VARCHAR(32) NOT NULL DEFAULT '#FFFFFF',
    `style` VARCHAR(32) NOT NULL DEFAULT 'modern',
    `x` DOUBLE NOT NULL DEFAULT 0,
    `y` DOUBLE NOT NULL DEFAULT 0,
    `scale` DOUBLE NOT NULL DEFAULT 1,
    `rotate` DOUBLE NOT NULL DEFAULT 0,
    `z` INTEGER NOT NULL DEFAULT 0,

    INDEX `CardTextLayer_cardId_idx`(`cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CardTextLayer` ADD CONSTRAINT `CardTextLayer_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
