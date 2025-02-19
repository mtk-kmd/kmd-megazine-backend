CREATE TABLE IF NOT EXISTS `product` (
    product_id VARCHAR(255) PRIMARY KEY,
    product_name VARCHAR(255),
    description TEXT,
    price DOUBLE,
    category_id VARCHAR(255),
    supplier_id VARCHAR(255),
    width DOUBLE,
    length DOUBLE,
    height DOUBLE,
    weight DOUBLE,
    depth DOUBLE,
    measured_by VARCHAR(20),
    weight_by VARCHAR(20),
    quantity INT,
    created_by VARCHAR(255),
    status boolean,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);