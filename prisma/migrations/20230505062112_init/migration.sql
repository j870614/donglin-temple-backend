/*
  Warnings:

  - You are about to drop the `Manager` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Manager`;

-- CreateTable
CREATE TABLE `Managers` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `Email` VARCHAR(255) NULL,
    `Line` VARCHAR(255) NULL,
    `Google` VARCHAR(255) NULL,
    `Password` VARCHAR(255) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Managers_Email_key`(`Email`),
    UNIQUE INDEX `Managers_Line_key`(`Line`),
    UNIQUE INDEX `Managers_Google_key`(`Google`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
