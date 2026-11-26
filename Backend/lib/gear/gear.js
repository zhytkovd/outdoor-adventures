const pool = require("../../db");


// gets all gear

async function listGear() {
  const [rows] = await pool.query(`
    SELECT
      g.gear_id,
      g.name,
      g.category_id,
      g.subcategory_id,
      c.name AS category_name,
      s.name AS subcategory,
      g.size,
      g.total_quantity,
      g.condition_status,
      g.maintenance_count,
      g.description,
      g.purchase_date,
      g.faculty_only,
      g.is_active,
      g.unit_cost,
      g.expiration_date,
      g.needs_cleaning,
        g.delivery_allowed,
        g.is_high_risk,

      CASE
        WHEN g.is_active = FALSE THEN 'Inactive'
        WHEN g.maintenance_count >= g.total_quantity
          THEN 'Maintenance'
        ELSE 'Available'
      END AS status

    FROM gear AS g

    JOIN categories AS c
      ON g.category_id = c.category_id

    LEFT JOIN subcategories AS s
      ON g.subcategory_id = s.subcategory_id

    ORDER BY g.name ASC;
  `);

  return rows;
}


// gets one gear by ID
async function getGearById(id){
    const [rows] = await pool.query(
    `SELECT * from gear WHERE gear_id = ? LIMIT 1`,
    [id]
    )

    return rows[0] ?? null;
}


// edit gear by id


async function updateGear(id, data) {
  const {
    name,
    description,
    category_id,
    subcategory_id,
    size,
    total_quantity,
    unit_cost,
    purchase_date,
    expiration_date,
    condition_status,
    maintenance_count,
    needs_cleaning,
    delivery_allowed,
    faculty_only,
    is_high_risk,
    is_active
  } = data;

  const [result] = await pool.execute(
    `UPDATE gear
     SET name = ?,
         description = ?,
         category_id = ?,
         subcategory_id = ?,
         size = ?,
         total_quantity = ?,
         unit_cost = ?,
         purchase_date = ?,
         expiration_date = ?,
         condition_status = ?,
         maintenance_count = ?,
         needs_cleaning = ?,
         delivery_allowed = ?,
         faculty_only = ?,
         is_high_risk = ?,
         is_active = ?
     WHERE gear_id = ?`,
    [
      name,
      description,
      category_id,
      subcategory_id,
      size,
      total_quantity,
      unit_cost,
      purchase_date,
      expiration_date,
      condition_status,
      maintenance_count,
      needs_cleaning,
      delivery_allowed,
      faculty_only,
      is_high_risk,
      is_active,
      id
    ]
  );

  return result.affectedRows;
}

// validate careegory and subcatefory if exists
async function validateGearCategory(category_id, subcategory_id){
    const [rows] = await pool.query(
    `SELECT category_id 
    FROM categories 
    WHERE category_id = ?`,
    [category_id])

    if(rows.length === 0){
        return "Category not found";
    }
    if (subcategory_id === null){
        return null
    }

    const [subrows] = await pool.query(
    `SELECT subcategory_id, subcategory_id
    FROM subcategories 
    WHERE category_id = ? AND subcategory_id = ?`,
    [category_id,subcategory_id])

    if(subrows.length === 0){
        return "Subcategory does not belong to the specified category";
    }
    return null
}

// create new gear
async function createGear(data){
    const {
        name,
        description,
        category_id,
        subcategory_id,
        size,
        total_quantity,
        unit_cost,
        purchase_date,
        expiration_date,
        condition_status,
        maintenance_count,
        needs_cleaning,
        delivery_allowed,
        faculty_only,
        is_high_risk,
        is_active
    } = data;

    const [result] = await pool.execute(
        `INSERT INTO gear(
            name,
            description,
            category_id,
            subcategory_id,
            size,
            total_quantity,
            unit_cost,
            purchase_date,
            expiration_date,
            condition_status,
            maintenance_count,
            needs_cleaning,
            delivery_allowed,
            faculty_only,
            is_high_risk,
            is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            description,
            category_id,
            subcategory_id,
            size,
            total_quantity,
            unit_cost,
            purchase_date,
            expiration_date,
            condition_status,
            maintenance_count,
            needs_cleaning,
            delivery_allowed,
            faculty_only,
            is_high_risk,
            is_active
        ]
    );

    return result.insertId;
}




module.exports = { listGear, getGearById, updateGear, validateGearCategory, createGear};