/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `Managers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Google]` on the table `Managers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Line]` on the table `Managers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Managers_Email_key` ON `Managers`(`Email`);

-- CreateIndex
CREATE UNIQUE INDEX `Managers_Google_key` ON `Managers`(`Google`);

-- CreateIndex
CREATE UNIQUE INDEX `Managers_Line_key` ON `Managers`(`Line`);
