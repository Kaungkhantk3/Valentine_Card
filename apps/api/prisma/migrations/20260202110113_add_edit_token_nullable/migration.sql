/*
  Warnings:

  - A unique constraint covering the columns `[editToken]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Card` ADD COLUMN `editToken` VARCHAR(128) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Card_editToken_key` ON `Card`(`editToken`);

-- CreateIndex
CREATE INDEX `Card_editToken_idx` ON `Card`(`editToken`);
