-- AlterTable
ALTER TABLE `users` ADD COLUMN `birthOrder` VARCHAR(100) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `relationship` VARCHAR(100) NULL;
