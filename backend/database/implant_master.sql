CREATE TABLE implant_master (
    implant_id INT AUTO_INCREMENT PRIMARY KEY,
    implant_name VARCHAR(255) NOT NULL,
    level_id INT,
    company_id INT,
    brand_id INT,
    model_id INT,
    connection_type_id INT,
    connection_shape_id INT,
    driver_shape_id INT,
    head_shape_id INT,
    body_shape_id INT,
    apex_shape_id INT,
    distributor_id INT,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified TINYINT(1),
    category_id INT
);