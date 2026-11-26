
const pool = require("../db");

async function main() {
  try {
    const [rows] = await pool.query(`
      SELECT
          g.gear_id,
          g.name,
          c.name AS category,
          s.name AS subcategory,
          g.size,
          c.icon
      FROM gear AS g
      JOIN categories AS c
          ON g.category_id = c.category_id
      LEFT JOIN subcategories AS s
          ON g.subcategory_id = s.subcategory_id
      ORDER BY g.gear_id;
    `);

    console.table(rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

main();
