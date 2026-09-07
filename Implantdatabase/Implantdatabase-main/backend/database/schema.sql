-- Create database
CREATE DATABASE IF NOT EXISTS `implant_db` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `implant_db`;

-- Companies table
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Levels table
CREATE TABLE IF NOT EXISTS `levels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_level_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Countries table
CREATE TABLE IF NOT EXISTS `countries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_country_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Implants table
CREATE TABLE IF NOT EXISTS `implants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(255) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `website` TEXT DEFAULT NULL,
  `brandDescription` LONGTEXT DEFAULT NULL,
  `companyId` INT DEFAULT NULL,
  `levelId` INT DEFAULT NULL,
  `countryId` INT DEFAULT NULL,
  `countryText` TEXT DEFAULT NULL,
  `connectionType` TEXT DEFAULT NULL,
  `connectionShape` TEXT DEFAULT NULL,
  `screwdriverShape` TEXT DEFAULT NULL,
  `headShape` TEXT DEFAULT NULL,
  `bodyShape` LONGTEXT DEFAULT NULL,
  `apexShape` TEXT DEFAULT NULL,
  `officialDistributor` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `image1` VARCHAR(500) DEFAULT NULL,
  `image2` VARCHAR(500) DEFAULT NULL,
  `image3` VARCHAR(500) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_implant_brand` (`brand`),
  INDEX `idx_implant_status` (`status`),
  INDEX `idx_implant_company` (`companyId`),
  INDEX `idx_implant_level` (`levelId`),
  INDEX `idx_implant_country` (`countryId`),
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`levelId`) REFERENCES `levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Official Distributors table
CREATE TABLE IF NOT EXISTS `official_distributors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `countryId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `contactInfo` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_distributor_country` (`countryId`),
  INDEX `idx_distributor_status` (`status`),
  FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `author` VARCHAR(255) DEFAULT 'Admin',
  `coverImage` VARCHAR(500) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `publishedAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_blog_slug` (`slug`),
  INDEX `idx_blog_status` (`status`),
  INDEX `idx_blog_published` (`publishedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback table
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(500) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'replied') DEFAULT 'new',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_feedback_status` (`status`),
  INDEX `idx_feedback_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: ilovedentalverymuch, hashed with bcrypt)
-- You should run this after the tables are created
-- INSERT INTO `users` (`username`, `email`, `password`, `role`, `status`) 
-- VALUES ('admin', 'admin@lamduan.mfu.ac.th', '$2a$10$...hash...', 'admin', 'Active');

-- Sample data for Companies
INSERT INTO `companies` (`name`, `status`) VALUES 
  ('Straumann', 'Active'),
  ('Nobel Biocare', 'Active'),
  ('Osstem', 'Active'),
  ('Dentium', 'Active'),
  ('Zimmer Biomet', 'Active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sample data for Levels
INSERT INTO `levels` (`name`, `status`) VALUES 
  ('Premium', 'Active'),
  ('Standard', 'Active'),
  ('Economy', 'Active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sample data for Countries
INSERT INTO `countries` (`name`, `status`) VALUES 
  ('Switzerland', 'Active'),
  ('Sweden', 'Active'),
  ('South Korea', 'Active'),
  ('United States', 'Active'),
  ('Germany', 'Active'),
  ('Thailand', 'Active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
