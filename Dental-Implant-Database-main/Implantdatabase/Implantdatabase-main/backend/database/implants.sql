CREATE TABLE implants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(255),
    slug VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    website TEXT,
    brandDescription LONGTEXT,

    companyId INT,
    levelId INT,
    countryId INT,

    countryText TEXT,

    connectionType TEXT,
    connectionShape TEXT,
    screwdriverShape TEXT,
    headShape TEXT,
    bodyShape LONGTEXT,
    apexShape TEXT,

    officialDistributor TEXT,

    status ENUM('Active','Inactive') DEFAULT 'Active',

    image1 LONGTEXT,
    image1Message LONGTEXT,

    image2 LONGTEXT,
    image2Message LONGTEXT,

    image3 LONGTEXT,
    image3Message LONGTEXT,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);