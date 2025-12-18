-- DropForeignKey
ALTER TABLE `media_comments` DROP FOREIGN KEY `media_comments_mediaId_fkey`;

-- DropForeignKey
ALTER TABLE `media_likes` DROP FOREIGN KEY `media_likes_mediaId_fkey`;

-- AddForeignKey
ALTER TABLE `media_likes` ADD CONSTRAINT `media_likes_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_comments` ADD CONSTRAINT `media_comments_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
