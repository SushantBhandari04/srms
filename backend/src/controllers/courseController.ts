import type { Request, Response } from "express";
import pool from "../config/db.js";

export const createCourse = async (req: Request, res: Response) => {
    const { courseCode, courseName, durationYears, departmentId } = req.body;
    const connection = await pool.getConnection();

    try {
        const [result]: any = await connection.query(`INSERT INTO courses (course_code, course_name, duration_years, department_id) VALUES (?, ?, ?, ?)`, [courseCode, courseName, durationYears, departmentId]);

        return res.status(200).json({
            message: "Course created successfully.",
            courseId: result.insertedId
        })
    } catch (error: any) {
        res.status(500).json({
            error: "Error creating course",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getCourse = async (req: Request, res: Response) => {
    const { id } = req.params; // get from URL params
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            courses.*, 
            departments.dept_code, 
            departments.dept_name 
            FROM courses 
            JOIN departments ON courses.department_id = departments.id 
            WHERE courses.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Course not found" });
        }

        res.status(200).json(rows[0]); // send only one course
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting course",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const getAllCourses = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
            courses.*, 
            departments.dept_code, 
            departments.dept_name 
            FROM courses 
            JOIN departments ON courses.department_id = departments.id `,
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({
            error: "Error getting courses",
            details: error.message,
        });
    } finally {
        connection.release();
    }
}

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { courseCode, courseName, durationYears, departmentId } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE courses SET course_code = ?, course_name = ?, duration_years = ?, department_id = ? WHERE id = ?`,
      [courseCode, courseName, durationYears, departmentId, id]
    );

    await connection.commit();
    res.status(200).json({ message: "Course updated successfully" });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error updating course:", error.message);
    res.status(500).json({
      error: "Error updating course",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      "DELETE FROM courses WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course:", error.message);
    res.status(500).json({
      error: "Error deleting course",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};