
-- 1. Add icons to categories
ALTER TABLE categories
    ADD COLUMN icon VARCHAR(50) NULL;

-- 2. Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    UNIQUE (category_id, name)
);

-- 3. Extend gear table
ALTER TABLE gear
    ADD COLUMN subcategory_id INT NULL,
    ADD COLUMN size VARCHAR(50) NULL,
    ADD CONSTRAINT fk_gear_subcategory
        FOREIGN KEY (subcategory_id)
        REFERENCES subcategories(subcategory_id);
