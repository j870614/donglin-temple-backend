/*
  Warnings:

  - The primary key for the `managers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CreatedAt` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `Email` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `Google` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `Line` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `UpdatedAt` on the `managers` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `managers` table. All the data in the column will be lost.
  - Added the required column `id` to the `Managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Managers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `managers` DROP PRIMARY KEY,
    DROP COLUMN `CreatedAt`,
    DROP COLUMN `Email`,
    DROP COLUMN `Google`,
    DROP COLUMN `Id`,
    DROP COLUMN `Line`,
    DROP COLUMN `Password`,
    DROP COLUMN `UpdatedAt`,
    DROP COLUMN `UserId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `google` VARCHAR(255) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `line` VARCHAR(255) NULL,
    ADD COLUMN `password` VARCHAR(255) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);
