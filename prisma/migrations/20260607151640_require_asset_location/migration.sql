-- Migration: require-asset-location
-- assets.locationId changed from nullable to NOT NULL.

-- Backfill any remaining NULLs (idempotent - no-op if already done).
UPDATE `assets`
SET `locationId` = (SELECT `id` FROM `locations` ORDER BY `createdAt` LIMIT 1)
WHERE `locationId` IS NULL;

-- Drop the old FK (it has ON DELETE SET NULL, incompatible with NOT NULL).
ALTER TABLE `assets`
  DROP FOREIGN KEY `assets_locationId_fkey`;

-- Now safe to make the column NOT NULL.
ALTER TABLE `assets`
  MODIFY COLUMN `locationId` VARCHAR(191) NOT NULL;

-- Re-add FK with RESTRICT (was SET NULL before).
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_locationId_fkey`
  FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;