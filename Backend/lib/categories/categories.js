const pool = require("../../db");

// retrieves all categories
async function listCategories(){

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
        ORDER BY c.name, s.name`
    )   
    const categories = new Map()

    for (const row of rows){
        if(!categories.has(row["category_id"])){
            const temp = {
                category_id: row.category_id,
                name: row.category_name,
                code: row.code,
                description: row.description,
                icon: row.icon,
                item_count: row.item_count,
                subcategories: []
            }
            categories.set(row.category_id, temp)
        }
        if (row.subcategory_id !== null){
            const subcategory = {subcategory_id:row.subcategory_id,name:row.subcategory_name}
            categories.get(row.category_id).subcategories.push(subcategory)
        }
    }

    return Array.from(categories.values()); 
}

async function createCategory(data){
    const {name, description, icon, subcategories} = data;

    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();
        
        //insert category
        const [result] = await connection.execute(
            `INSERT INTO categories(name,description,icon)
            VALUES (?,?,?)
            `,
            [name,description,icon]
        )

        const categoryId = result.insertId;

        // Insert subcategories 
        for(const subcategory of subcategories){
            await connection.execute(
            `INSERT INTO subcategories(category_id,name)
            VALUES (?,?)
            `,
            [categoryId,subcategory.name]
        )
        }
        await connection.commit();
        return categoryId
    }
    catch(error){
        await connection.rollback();
        throw error;
    }
    finally{
        connection.release();
    }
}

module.exports = {listCategories,createCategory};
