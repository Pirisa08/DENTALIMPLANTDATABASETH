CREATE TABLE brand (
    idbrand INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(200) NOT NULL,
    manufacturer_id INT,
    website VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);