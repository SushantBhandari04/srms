import pool from "../config/db.js";

export async function checkIsAdmin({ userId }: { userId: string }) {
    const connection = await pool.getConnection();

    const [user]: any = await connection.query(`SELECT * FROM users WHERE id = ?`, [userId]);

    if (user.role == 'admin') {
        return true;
    }
    else {
        return false;
    }
}