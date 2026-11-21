
-- 1. Insert subcategories
INSERT IGNORE INTO subcategories (category_id, name)
SELECT c.category_id, s.name
FROM (
    SELECT 'CAT-CAMP' AS code, 'Tents' AS name
    UNION ALL SELECT 'CAT-CAMP', 'Sleeping Bags'
    UNION ALL SELECT 'CAT-CAMP', 'Stoves'
    UNION ALL SELECT 'CAT-WATER', 'Kayaks'
    UNION ALL SELECT 'CAT-WATER', 'Paddles'
    UNION ALL SELECT 'CAT-WATER', 'Life Vests'
    UNION ALL SELECT 'CAT-HIKE', 'Backpacks'
    UNION ALL SELECT 'CAT-HIKE', 'Trekking Poles'
    UNION ALL SELECT 'CAT-CLIMB', 'Harnesses'
    UNION ALL SELECT 'CAT-CLIMB', 'Ropes'
    UNION ALL SELECT 'CAT-WIN', 'Snowshoes'
) AS s
JOIN categories AS c
    ON c.code = s.code;

-- 2. Add sample icon identifiers
UPDATE categories
SET icon = CASE code
    WHEN 'CAT-CAMP' THEN 'tent'
    WHEN 'CAT-WATER' THEN 'waves'
    WHEN 'CAT-HIKE' THEN 'footprints'
    WHEN 'CAT-CLIMB' THEN 'mountain'
    WHEN 'CAT-WIN' THEN 'snowflake'
    WHEN 'CAT-SET' THEN 'package'
END
WHERE code IN (
    'CAT-CAMP', 'CAT-WATER', 'CAT-HIKE',
    'CAT-CLIMB', 'CAT-WIN', 'CAT-SET'
);

-- 3. Assign subcategories and sizes to test gear
UPDATE gear AS g
JOIN categories AS c
    ON g.category_id = c.category_id
JOIN (
    SELECT '2-Person Tent' AS gear_name,
           'CAT-CAMP' AS code,
           'Tents' AS subcategory,
           '2-Person' AS size
    UNION ALL
    SELECT 'Hiking Backpack', 'CAT-HIKE',
           'Backpacks', 'Medium'
    UNION ALL
    SELECT 'Kayak', 'CAT-WATER',
           'Kayaks', 'Single-person'
    UNION ALL
    SELECT 'Climbing Harness', 'CAT-CLIMB',
           'Harnesses', 'Medium'
    UNION ALL
    SELECT 'Snowshoes', 'CAT-WIN',
           'Snowshoes', 'Adult'
) AS v
    ON g.name = v.gear_name AND c.code = v.code
JOIN subcategories AS s
    ON s.category_id = c.category_id
    AND s.name = v.subcategory
SET
    g.subcategory_id = s.subcategory_id,
    g.size = v.size;
