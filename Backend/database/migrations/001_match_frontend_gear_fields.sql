-- MIGRATION 001: make gear/category/history columns match the Frontend GearItem
-- (Frontend/app/rentals/types.ts). Run once on a database created from the
-- original schema.sql. schema.sql already includes these changes for new setups.
--
-- Safe only while `gear` is empty: the condition_status values change, and
-- MySQL can't convert old values ('ready', ...) to the new ones automatically.

-- Categories: short codes the Frontend uses as categoryId (e.g. CAT-CAMP).
ALTER TABLE categories
    ADD COLUMN code VARCHAR(20) NULL UNIQUE AFTER category_id;

-- Gear: inventory fields + condition model used by the Frontend.
--   condition_status  overall condition label (Good / Minor wear / Damaged)
--   needs_cleaning    flag shown in the OAP hold queue
--   maintenance_count units held out of stock for cleaning/repair; only these
--                     units are unavailable, not the whole row
ALTER TABLE gear
    ADD COLUMN unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER total_quantity,
    ADD COLUMN purchase_date DATE NULL AFTER unit_cost,
    MODIFY COLUMN condition_status ENUM('good', 'minor_wear', 'damaged')
        NOT NULL DEFAULT 'good',
    ADD COLUMN needs_cleaning BOOLEAN NOT NULL DEFAULT FALSE AFTER condition_status,
    ADD COLUMN maintenance_count INT NOT NULL DEFAULT 0 AFTER needs_cleaning,
    ADD COLUMN faculty_only BOOLEAN NOT NULL DEFAULT FALSE AFTER delivery_allowed,
    ADD COLUMN illustration_type VARCHAR(30) NULL AFTER is_active,
    ADD CONSTRAINT chk_gear_unit_cost CHECK (unit_cost >= 0),
    ADD CONSTRAINT chk_gear_maintenance_count
        CHECK (maintenance_count >= 0 AND maintenance_count <= total_quantity);

-- Sets: catalog picture.
ALTER TABLE gear_sets
    ADD COLUMN illustration_type VARCHAR(30) NULL AFTER category_id;

-- Edit history: number of units involved (Frontend gearHistory.amount).
ALTER TABLE edit_history
    ADD COLUMN amount INT NULL AFTER action;

-- Default categories used by the Frontend's "Add Gear" form
-- (DEFAULT_CATEGORIES in Frontend/app/rentals/api.ts).
INSERT INTO categories (code, name, description) VALUES
    ('CAT-CAMP',  'Camping',  'Tents, sleeping bags, stoves, and camp comfort gear'),
    ('CAT-WATER', 'Water',    'Watercraft, paddles, and personal flotation devices'),
    ('CAT-HIKE',  'Hiking',   'Backpacks and trail support equipment'),
    ('CAT-CLIMB', 'Climbing', 'Technical climbing harnesses and protection gear'),
    ('CAT-WIN',   'Winter',   'Snowshoes and cold-weather expedition gear'),
    ('CAT-SET',   'Sets',     'Complete pre-bundled outdoor equipment sets');
