import type { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt"
import { getCombinedNodeFlags, getConstantValue } from "typescript";

export const createFaculty = async (req: Request, res: Response) => {
    const { name, email, password, departmentId, facultyCode, phone, joiningDate } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // first create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await connection.query(`INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`, [name, email, hashedPassword, 'faculty']);
        const userId = result.insertId

        // create faculty now
        const [rows]: any = await connection.query(`INSERT INTO faculty (user_id, department_id, faculty_code, phone, joining_date) VALUES (?, ?, ?, ?, ?)`, [userId, departmentId, facultyCode, phone, joiningDate]);
        const facultyId = rows.insertId;

        await connection.commit();
        return res.status(200).json({
            message: "Faculty created successfully.",
            facultyId
        })
    }
    catch (error: any) {
        res.status(500).json({
            error: "Error creating faculty!",
            details: error.message
        })
    }
    finally {
        connection.release();
    }
}

export const getFaculty = async (req: Request, res: Response) => {
    const { id } = req.params; // get from URL params
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            faculty.id as faculty_id,
            users.name as faculty_name,
            users.email,
            departments.dept_code,
            departments.dept_name
            FROM faculty
            JOIN users ON faculty.user_id = users.id
            JOIN departments ON faculty.department_id = departments.id
            where faculty.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Faculty not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting faculty!",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getAllFaculties = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            faculty.id as faculty_id,
            faculty.user_id,
            users.name as faculty_name,
            users.email,
            departments.dept_code,
            departments.dept_name
            FROM faculty
            JOIN users ON faculty.user_id = users.id
            JOIN departments ON faculty.department_id = departments.id`,
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting faculties!",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const updateFaculty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, departmentId, facultyCode, phone, joiningDate } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get user_id from faculty
        const [faculty]: any = await connection.query(`SELECT user_id FROM faculty WHERE id = ?`, [id]);
        if (faculty.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Faculty not found" });
        }
        const userId = faculty[0].user_id;

        // Update user table
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(
                `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
                [name, email, hashedPassword, userId]
            );
        } else {
            await connection.query(
                `UPDATE users SET name = ?, email = ? WHERE id = ?`,
                [name, email, userId]
            );
        }

        // Update faculty table
        await connection.query(
            `UPDATE faculty SET department_id = ?, faculty_code = ?, phone = ?, joining_date = ? WHERE id = ?`,
            [departmentId, facultyCode, phone, joiningDate, id]
        );

        await connection.commit();
        return res.status(200).json({
            message: "Faculty updated successfully."
        });
    } catch (error: any) {
        await connection.rollback();
        res.status(500).json({
            error: "Error updating faculty!",
            details: error.message
        });
    } finally {
        connection.release();
    }
};

export const deleteFaculty = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(403).json({
            message: "id missing!"
        })
    }

    const connection = await pool.getConnection();

    try {
        const [user]: any = await connection.query(`SELECT user_id FROM faculty WHERE id = ?`, [id]);

        if (user.length === 0) {
            return res.status(404).json({ error: "Faculty not found" });
        }

        const userId = user[0].user_id;

        await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);

        return res.status(200).json({
            message: "Faculty deleted successfully!"
        });
    } catch (err: any) {
        return res.status(400).json({
            message: "Error deleting faculty!",
            details: err.message
        });
    } finally {
        connection.release();
    }
}