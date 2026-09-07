CREATE TABLE implant_model (
    idmodel INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT,
    model_code VARCHAR(100),
    connection_type VARCHAR(20),
    material_code VARCHAR(20),
    diameter_mm DECIMAL(4,2),
    length_mm DECIMAL(4,1),
    is_active TINYINT(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);