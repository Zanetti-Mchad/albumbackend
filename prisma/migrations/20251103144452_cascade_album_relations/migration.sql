-- DropForeignKey
ALTER TABLE `album_comments` DROP FOREIGN KEY `album_comments_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `album_likes` DROP FOREIGN KEY `album_likes_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `media_albumId_fkey`;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `album_likes` ADD CONSTRAINT `album_likes_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `album_comments` ADD CONSTRAINT `album_comments_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
