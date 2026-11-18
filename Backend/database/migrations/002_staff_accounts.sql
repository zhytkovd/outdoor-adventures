-- MIGRATION 002: separate OAP staff logins from the people who reserve gear.
--
--   users           people who reserve gear (students, faculty, staff). They
--                   sign in on /rentals with their B#. Now with is_active.
--   staff_accounts  OAP staff portal logins: username + password. Created in
--                   the staff portal's Users tab; the password is generated
--                   by the system. The first one is made with
--                   `npm run create-staff` in Backend.
--
-- reservations.staff_id and edit_history.staff_id now record the staff
-- account's username (who approved, checked out, cleaned, edited...).
--
-- Run once, after 001. schema.sql already includes these changes.

-- 1. Staff accounts
CREATE TABLE staff_accounts (
    staff_account_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,

    FOREIGN KEY (created_by)
        REFERENCES staff_accounts(username)
);

-- 2. Renters can be deactivated (blocked from reserving) without deleting
--    their reservation history.
ALTER TABLE users
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role;

-- 3. Remove the test log rows written by the old "Who's working?" picker
--    (it logged users added as OAP staff). They point at users, not staff
--    accounts, and would block the new foreign key below.
DELETE FROM edit_history
WHERE entity_type = 'user'
  AND (action = 'Added as OAP staff' OR action LIKE 'Promoted to OAP staff%');

-- 4. staff_id now points to staff_accounts.username.
ALTER TABLE reservations
    DROP FOREIGN KEY reservations_ibfk_2;
ALTER TABLE reservations
    MODIFY COLUMN staff_id VARCHAR(50) NULL,
    ADD CONSTRAINT fk_reservations_staff
        FOREIGN KEY (staff_id) REFERENCES staff_accounts(username);

ALTER TABLE edit_history
    DROP FOREIGN KEY edit_history_ibfk_1;
ALTER TABLE edit_history
    MODIFY COLUMN staff_id VARCHAR(50) NOT NULL,
    MODIFY COLUMN entity_type ENUM('user', 'gear', 'reservation', 'staff_account') NOT NULL,
    ADD CONSTRAINT fk_edit_history_staff
        FOREIGN KEY (staff_id) REFERENCES staff_accounts(username);
