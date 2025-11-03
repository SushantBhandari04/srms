import type { Request, Response } from "express";
import pool from "../config/db.js";

export const createSubject = async (req: Request, res: Response) => {
    const { subjectName, subjectCode, courseId, credits } = req.body;
    const connection = await pool.getConnection();

    try {
        // check courseId exits or not
        const [course]: any = await connection.query(`SELECT id FROM courses WHERE id = ?`, courseId);
        if (course.length === 0) {
            return res.status(400).json({
                error: `Course with courseId ${courseId} does not exist!`
            })
        }

        const [rows]: any = await connection.query(`INSERT INTO subjects (subject_name, subject_code, course_id, credits) VALUES (?, ?, ?, ?)`, [subjectName, subjectCode, courseId, credits]);

        return res.status(201).json({
            message: "Subject created successfully.",
            subjectId: rows.insertedId
        })
    } catch (error: any) {
        res.status(500).json({
            error: "Error creating subject!",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getSubject = async (req: Request, res: Response) => {
    const { id } = req.params; // get from URL params
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            subjects.id as subject_id, 
            subjects.subject_name,
            subjects.subject_code,
            subjects.credits,
            courses.id as course_id,
            faculty.id as faculty_id,
            courses.course_name as course_name,
            courses.course_code,
            users.name as faculty_name,
            users.email as faculty_email
            FROM subjects 
            INNER JOIN faculty ON subjects.faculty_id = faculty.id
            INNER JOIN courses ON subjects.course_id = courses.id
            INNER JOIN users ON faculty.user_id = users.id
            WHERE subjects.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Subject not found!" });
        }

        res.status(200).json(rows[0]); // send only one course
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting subject",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getAllSubjects = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT
            subjects.id as subject_id, 
            subjects.subject_name,
            subjects.subject_code,
            subjects.credits,
            courses.id as course_id,
            faculty.id as faculty_id,
            courses.course_name as course_name,
            courses.course_code,
            users.name as faculty_name,
            users.email as faculty_email
            FROM subjects 
            LEFT JOIN faculty ON subjects.faculty_id = faculty.id
            INNER JOIN courses ON subjects.course_id = courses.id
            LEFT JOIN users ON faculty.user_id = users.id`,
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting subjects!",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}


export const assignFacultyToSubject = async (req: Request, res: Response) => {
    const { subjectId, facultyId } = req.body;
    const connection = await pool.getConnection();

    try {
        // Check if subject exists
        const [subject]: any = await connection.query(`SELECT id FROM subjects WHERE id = ?`, [subjectId]);
        if (subject.length === 0) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Check if faculty exists
        const [faculty]: any = await connection.query(`SELECT id FROM faculty WHERE id = ?`, [facultyId]);
        if (faculty.length === 0) {
            return res.status(404).json({ error: "Faculty not found" });
        }

        // Assign faculty to subject
        await connection.query(`UPDATE subjects SET faculty_id = ? WHERE id = ?`, [facultyId, subjectId]);

        res.status(200).json({ message: "Faculty assigned to subject successfully" });
    } catch (error: any) {
        console.error("Error assigning faculty:", error.message);
        res.status(500).json({
            error: "Error assigning faculty to subject",
            details: error.message,
        });
    } finally {
        connection.release();
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { subjectName, subjectCode, courseId, credits, facultyId } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Update subject
        await connection.query(
            `UPDATE subjects SET subject_name = ?, subject_code = ?, course_id = ?, credits = ?, faculty_id = ? WHERE id = ?`,
            [subjectName, subjectCode, courseId, credits, facultyId || null, id]
        );

        await connection.commit();
        res.status(200).json({ message: "Subject updated successfully" });
    } catch (error: any) {
        await connection.rollback();
        console.error("Error updating subject:", error.message);
        res.status(500).json({
            error: "Error updating subject",
            details: error.message,
        });
    } finally {
        connection.release();
    }
};

export const deleteSubject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        const [result]: any = await connection.query("DELETE FROM subjects WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Subject not found" });
        }

        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting subject:", error.message);
        res.status(500).json({
            error: "Error deleting subject",
            details: error.message,
        });
    } finally {
        connection.release();
    }
};