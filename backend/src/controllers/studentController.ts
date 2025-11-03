import type { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from 'bcrypt';

export const createStudent = async (req: Request, res: Response) => {
    const { name, email, password, rollNumber, dateOfBirth, admissionYear, phone, address, gender, departmentId, courseId } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // first create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await pool.query(`INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`, [name, email, hashedPassword, 'student']);
        const userId = result.insertId

        // create student now
        const [studentResult]: any = await connection.query(`INSERT INTO students (user_id, roll_no, date_of_birth, admission_year, phone, address, gender, department_id, course_id) 
            VALUES (?,?,?,?,?,?,?,?,?)`, [userId, rollNumber, dateOfBirth, admissionYear, phone, address, gender, departmentId, courseId]);
        const studentId = studentResult.insertId;

        await connection.commit();
        return res.status(200).json({
            message: "Student created successfully.",
            studentId: studentId
        })
    }
    catch (error: any) {
        res.status(500).json({
            error: "Error creating student!",
            details: error.message
        })
    }
    finally {
        connection.release();
    }
}

export const getStudent = async (req: Request, res: Response) => {
    const { id } = req.params; // get from URL params
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            students.*,
            users.name as student_name,
            users.email,
            departments.dept_name as department_name,
            courses.course_name as course_name
            FROM students
            INNER JOIN users ON students.user_id = users.id
            INNER JOIN departments ON students.department_id = departments.id
            INNER JOIN courses ON students.course_id = courses.id
            where students.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Student not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting student",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getAllStudents = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            students.*,
            users.name as student_name,
            users.email,
            departments.dept_name as department_name,
            courses.course_name as course_name
            FROM students
            INNER JOIN users ON students.user_id = users.id
            INNER JOIN departments ON students.department_id = departments.id
            INNER JOIN courses ON students.course_id = courses.id`,
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting students",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const updateStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, rollNumber, dateOfBirth, admissionYear, phone, address, gender, departmentId, courseId } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get user_id from student
        const [student]: any = await connection.query(`SELECT user_id FROM students WHERE id = ?`, [id]);
        if (student.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Student not found" });
        }
        const userId = student[0].user_id;

        // Update user table
        if (password && password.trim() !== '') {
            // If password is provided, hash and update it
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query(
                `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
                [name, email, hashedPassword, userId]
            );
        } else {
            // Don't update password if not provided
            await connection.query(
                `UPDATE users SET name = ?, email = ? WHERE id = ?`,
                [name, email, userId]
            );
        }

        // Update student table
        await connection.query(
            `UPDATE students SET roll_no = ?, date_of_birth = ?, admission_year = ?, phone = ?, address = ?, gender = ?, department_id = ?, course_id = ? WHERE id = ?`,
            [rollNumber, dateOfBirth, admissionYear, phone, address, gender, departmentId, courseId, id]
        );

        await connection.commit();
        return res.status(200).json({
            message: "Student updated successfully."
        });
    } catch (error: any) {
        await connection.rollback();
        res.status(500).json({
            error: "Error updating student!",
            details: error.message
        });
    } finally {
        connection.release();
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(403).json({
            message: "id missing!"
        })
    }

    const connection = await pool.getConnection();

    try {
        const [user]: any = await connection.query(`SELECT user_id FROM students WHERE id = ?`, [id]);

        if (user.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const userId = user[0].user_id;

        await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);

        return res.status(200).json({
            message: "Student deleted successfully!"
        });
    } catch (err: any) {
        return res.status(400).json({
            message: "Error deleting student!",
            details: err.message
        });
    } finally {
        connection.release();
    }
}