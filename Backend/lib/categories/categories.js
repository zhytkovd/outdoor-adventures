const pool = require("../../db");

// retrieves all categories
async function listCategories() {
  const [rows] = await pool.query(
    `SELECT c.category_id, c.name AS category_name,
        c.code, c.description, c.icon,
        s.subcategory_id, s.name AS subcategory_name,
        (SELECT COUNT(*)
        FROM gear AS g
        WHERE g.category_id = c.category_id) AS item_count
        FROM categories AS c
        LEFT JOIN subcategories AS s
        ON c.category_id = s.category_id
        ORDER BY c.name, s.name`,
  );
  const categories = new Map();

  for (const row of rows) {
    if (!categories.has(row["category_id"])) {
      const temp = {
        category_id: row.category_id,
        name: row.category_name,
        code: row.code,
        description: row.description,
        icon: row.icon,
        item_count: row.item_count,
        subcategories: [],
      };
      categories.set(row.category_id, temp);
    }
    if (row.subcategory_id !== null) {
      const subcategory = {
        subcategory_id: row.subcategory_id,
        name: row.subcategory_name,
      };
      categories.get(row.category_id).subcategories.push(subcategory);
    }
  }

  return Array.from(categories.values());
}

async function createCategory(data) {
  const { name, description, icon, subcategories } = data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //insert category
    const [result] = await connection.execute(
      `INSERT INTO categories(name,description,icon)
            VALUES (?,?,?)
            `,
      [name, description, icon],
    );

    const categoryId = result.insertId;

    // Insert subcategories
    for (const subcategory of subcategories) {
      await connection.execute(
        `INSERT INTO subcategories(category_id,name)
            VALUES (?,?)
            `,
        [categoryId, subcategory.name],
      );
    }
    await connection.commit();
    return categoryId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// updates category and its subcategories
async function updateCategory(id, data) {
  const { name, description, icon, subcategories } = data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if category exists
    const [categoryRows] = await connection.execute(
      `SELECT category_id
      FROM categories
      WHERE category_id = ?
      FOR UPDATE`,
      [id],
    );

    if (categoryRows.length === 0) {
      throw new Error("Category not found");
    }

    // Retrieve original subcategories
    const [rows] = await connection.execute(
      `SELECT subcategory_id
      FROM subcategories
      WHERE category_id = ?`,
      [id],
    );

    const existingIds = new Set(rows.map((row) => row.subcategory_id));

    // Update category information
    await connection.execute(
      `UPDATE categories
      SET name = ?,
      description = ?,
      icon = ?
      WHERE category_id = ?`,
      [name.trim(), description, icon, id],
    );

    // Update existing and insert new subcategories
    for (const subcategory of subcategories) {
      if (subcategory.subcategory_id !== undefined) {
        if (!existingIds.has(subcategory.subcategory_id)) {
          throw new Error("Subcategory not found");
        }

        await connection.execute(
          `UPDATE subcategories
          SET name = ?
          WHERE subcategory_id = ? AND category_id = ?`,
          [subcategory.name.trim(), subcategory.subcategory_id, id],
        );
      } else {
        await connection.execute(
          `INSERT INTO subcategories (name, category_id)
          VALUES (?,?)`,
          [subcategory.name.trim(), id],
        );
      }
    }

    // Collect submitted existing IDs
    const ids = new Set();

    for (const subcategory of subcategories) {
      if (subcategory.subcategory_id !== undefined) {
        ids.add(subcategory.subcategory_id);
      }
    }

    // Remove unused subcategories
    for (const row of rows) {
      if (!ids.has(row.subcategory_id)) {
        // Check whether subcategory is in use
        const [result] = await connection.execute(
          `SELECT 1
          FROM gear
          WHERE subcategory_id = ?
          LIMIT 1`,
          [row.subcategory_id],
        );

        if (result.length > 0) {
          throw new Error("Cannot delete subcategory: gear is using it");
        }

        // Delete subcategory
        await connection.execute(
          `DELETE FROM subcategories
          WHERE subcategory_id = ? AND category_id = ?`,
          [row.subcategory_id, id],
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// deletes category and its subcategories
async function deleteCategory(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if category exists
    const [categoryRows] = await connection.execute(
      `SELECT category_id
      FROM categories
      WHERE category_id = ?
      FOR UPDATE`,
      [id],
    );

    if (categoryRows.length === 0) {
      throw new Error("Category not found");
    }
    //Check whether gear references this category
    const [result] = await connection.execute(
      `SELECT 1
      FROM gear
      WHERE category_id = ?
      LIMIT 1`,
      [id],
    );

    if (result.length > 0) {
      throw new Error("Cannot delete category: gear is using it");
    }

    // Check whether gear sets reference this category
    const [result2] = await connection.execute(
      `SELECT 1
      FROM gear_sets
      WHERE category_id = ?
      LIMIT 1`,
      [id],
    );

    if (result2.length > 0) {
      throw new Error("Cannot delete category: gear set is using it");
    }

    // Delete all subcategories belonging to this category
    await connection.execute(
      `DELETE FROM subcategories
      WHERE category_id = ?`,
      [id],
    );

    // Delete the category itself
    await connection.execute(
      `
      DELETE FROM categories
      WHERE category_id = ?`,
      [id],
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory};
