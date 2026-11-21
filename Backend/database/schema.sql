
-- OUTDOOR ADVENTURES DATABASE SCHEMA

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    bnumber VARCHAR(20) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    role ENUM('student', 'faculty', 'staff', 'oap')
        NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 1b. STAFF ACCOUNTS
CREATE TABLE IF NOT EXISTS staff_accounts (
    staff_account_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,

    FOREIGN KEY (created_by)
        REFERENCES staff_accounts(username)
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NULL
);

-- 2b. SUBCATEGORIES
CREATE TABLE IF NOT EXISTS subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    UNIQUE (category_id, name)
);

-- 3. GEAR
CREATE TABLE IF NOT EXISTS gear (
    gear_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    total_quantity INT NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    purchase_date DATE,
    expiration_date DATE,
    subcategory_id INT NULL,
    size VARCHAR(50) NULL,
    condition_status ENUM(
        'good',
        'minor_wear',
        'damaged'
    ) NOT NULL DEFAULT 'good',
    needs_cleaning BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_count INT NOT NULL DEFAULT 0,
    delivery_allowed BOOLEAN DEFAULT FALSE,
    faculty_only BOOLEAN NOT NULL DEFAULT FALSE,
    staff_only BOOLEAN NOT NULL DEFAULT FALSE,
    is_high_risk BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    illustration_type VARCHAR(30),

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    FOREIGN KEY (subcategory_id)
        REFERENCES subcategories(subcategory_id),

    CHECK (total_quantity > 0),
    CONSTRAINT chk_gear_unit_cost
        CHECK (unit_cost >= 0),
    CONSTRAINT chk_gear_maintenance_count
        CHECK (
            maintenance_count >= 0
            AND maintenance_count <= total_quantity
        )
);

-- 4. GEAR SETS
CREATE TABLE IF NOT EXISTS gear_sets (
    set_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    illustration_type VARCHAR(30),

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);

-- 5. SET ITEMS
CREATE TABLE IF NOT EXISTS set_items (
    set_id INT NOT NULL,
    gear_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,

    PRIMARY KEY (set_id, gear_id),

    FOREIGN KEY (set_id)
        REFERENCES gear_sets(set_id),

    FOREIGN KEY (gear_id)
        REFERENCES gear(gear_id),

    CHECK (quantity > 0)
);

-- 6. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(50),
    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    checkout_date DATETIME NOT NULL,
    checkin_date DATETIME NOT NULL,
    pickup_delivery ENUM('pickup', 'delivery')
        NOT NULL DEFAULT 'pickup',
    status ENUM(
        'pending',
        'approved',
        'denied',
        'checked_out',
        'returned',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    notes TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(bnumber),

    CONSTRAINT fk_reservations_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff_accounts(username),

    CHECK (checkin_date > checkout_date)
);

-- 7. RESERVATION ITEMS
CREATE TABLE IF NOT EXISTS reservation_items (
    reservation_item_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    gear_id INT NULL,
    set_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,

    FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id),

    FOREIGN KEY (gear_id)
        REFERENCES gear(gear_id),

    FOREIGN KEY (set_id)
        REFERENCES gear_sets(set_id),

    CHECK (quantity > 0),

    CHECK (
        (gear_id IS NOT NULL AND set_id IS NULL)
        OR
        (gear_id IS NULL AND set_id IS NOT NULL)
    )
);

-- 8. EDIT HISTORY
CREATE TABLE IF NOT EXISTS edit_history (
    edit_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL,
    entity_type ENUM(
        'user',
        'gear',
        'reservation',
        'staff_account'
    ) NOT NULL,
    entity_id VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    amount INT,
    edit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    CONSTRAINT fk_edit_history_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff_accounts(username)
);

-- DEFAULT CATEGORIES
INSERT IGNORE INTO categories
    (code, name, description)
VALUES
    ('CAT-CAMP', 'Camping',
     'Tents, sleeping bags, stoves, and camp comfort gear'),

    ('CAT-WATER', 'Water',
     'Watercraft, paddles, and personal flotation devices'),

    ('CAT-HIKE', 'Hiking',
     'Backpacks and trail support equipment'),

    ('CAT-CLIMB', 'Climbing',
     'Technical climbing harnesses and protection gear'),

    ('CAT-WIN', 'Winter',
     'Snowshoes and cold-weather expedition gear'),

    ('CAT-SET', 'Sets',
     'Complete pre-bundled outdoor equipment sets');
