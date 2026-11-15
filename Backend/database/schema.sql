
-- OUTDOOR ADVENTURES DATABASE SCHEMA

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    bnumber VARCHAR(20) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    role ENUM('student', 'faculty', 'staff', 'oap')
        NOT NULL DEFAULT 'student'
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. GEAR
CREATE TABLE IF NOT EXISTS gear (
    gear_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    total_quantity INT NOT NULL DEFAULT 1,
    expiration_date DATE,
    condition_status ENUM(
        'ready',
        'needs_cleaning',
        'needs_repair'
    ) NOT NULL DEFAULT 'ready',
    delivery_allowed BOOLEAN DEFAULT FALSE,
    is_high_risk BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CHECK (total_quantity > 0)
);

-- 4. GEAR SETS
CREATE TABLE IF NOT EXISTS gear_sets (
    set_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,

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
    staff_id VARCHAR(20),
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

    FOREIGN KEY (staff_id)
        REFERENCES users(bnumber),

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
    staff_id VARCHAR(20) NOT NULL,
    entity_type ENUM('user', 'gear', 'reservation')
        NOT NULL,
    entity_id VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    edit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (staff_id)
        REFERENCES users(bnumber)
);
