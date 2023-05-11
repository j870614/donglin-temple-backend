/*
  Warnings:

  - The primary key for the `managers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `google` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `managers` table. All the data in the column will be lost.
  - Added the required column `Id` to the `managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UpdatedAt` to the `managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `managers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `managers` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `google`,
    DROP COLUMN `id`,
    DROP COLUMN `line`,
    DROP COLUMN `password`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `Email` VARCHAR(255) NULL,
    ADD COLUMN `Google` VARCHAR(255) NULL,
    ADD COLUMN `Id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `Line` VARCHAR(255) NULL,
    ADD COLUMN `Password` VARCHAR(255) NOT NULL,
    ADD COLUMN `UpdatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `UserId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`Id`);

-- CreateTable
CREATE TABLE `optionnamemapping` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Group` VARCHAR(45) NOT NULL,
    `OptionId` SMALLINT NOT NULL,
    `OptionName` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
