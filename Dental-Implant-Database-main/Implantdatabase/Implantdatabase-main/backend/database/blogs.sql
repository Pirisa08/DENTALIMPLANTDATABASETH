CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content LONGTEXT,
    category VARCHAR(255),
    author VARCHAR(255),
    publishedDate DATETIME,
    readTime VARCHAR(255),
    ctaLabel VARCHAR(255),
    ctaUrl VARCHAR(255),
    manualUrl VARCHAR(255),
    referenceUrl VARCHAR(255),
    image LONGTEXT,
    imageDataUrl LONGTEXT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
