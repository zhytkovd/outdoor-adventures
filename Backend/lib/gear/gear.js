const pool = require("../../db");


// gets all gear
async function listGear() {
  
    const [rows] = await pool.query( // returns rows/fields
    `SELECT 
    g.gear_id, 
    g.name, 
    c.name AS category_name, 
    g.total_quantity,
    g.condition_status,
    g.maintenance_count,
    g.faculty_only,
    g.is_active
        FROM gear AS g
        JOIN categories AS c
            ON g.category_id = c.category_id
        ORDER BY g.name ASC;`
    );

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

// edits gear by id
async function updateGear(id, gearData) {
  const {
    name,
    total_quantity,
    condition_status,
    maintenance_count,
    faculty_only,
    is_active
  } = gearData;

  const [result] = await pool.execute(
    `UPDATE gear
     SET name = ?,
         total_quantity = ?,
         condition_status = ?,
         maintenance_count = ?,
         faculty_only = ?,
         is_active = ?
     WHERE gear_id = ?`,
    [
      name,
      total_quantity,
      condition_status,
      maintenance_count,
      faculty_only,
      is_active,
      id
    ]
  );

  return result.affectedRows;
}

module.exports = { listGear, getGearById, updateGear};