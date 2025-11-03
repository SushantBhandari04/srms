import type { Request, Response } from "express";
import pool from "../config/db.js";

// ✅ Add Marks
export const addMarks = async (req: Request, res: Response) => {
  const { studentId, subjectId, internalMarks, externalMarks } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if marks already exist for this student-subject combination
    const [existing]: any = await connection.query(
      `SELECT id FROM marks WHERE student_id = ? AND subject_id = ?`,
      [studentId, subjectId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "Marks already exist for this student in this subject. Please use update instead.",
      });
    }

    const [result]: any = await connection.query(
      `INSERT INTO marks (student_id, subject_id, internal_marks, external_marks)
       VALUES (?, ?, ?, ?)`,
      [studentId, subjectId, internalMarks, externalMarks]
    );

    await connection.commit();

    res.status(200).json({
      message: "Marks added successfully.",
      marksId: result.insertId,
    });
  } catch (error: any) {
    await connection.rollback();
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        error: "Marks already exist for this student in this subject.",
      });
    } else {
      res.status(500).json({
        error: "Error adding marks!",
        details: error.message,
      });
    }
  } finally {
    connection.release();
  }
};

// ✅ Update Marks
export const updateMarks = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { internalMarks, externalMarks } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE marks 
       SET internal_marks = ?, external_marks = ?
       WHERE id = ?`,
      [internalMarks, externalMarks, id]
    );

    await connection.commit();
    res.status(200).json({ message: "Marks updated successfully." });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      error: "Error updating marks!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get Marks by Student
export const getMarksByStudent = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        marks.id as marks_id,
        subjects.subject_name,
        subjects.subject_code,
        marks.internal_marks,
        marks.external_marks
      FROM marks
      JOIN subjects ON marks.subject_id = subjects.id
      WHERE marks.student_id = ?`,
      [studentId]
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching marks by student!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get Marks by Subject
export const getMarksBySubject = async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        marks.id as marks_id,
        students.roll_no,
        users.name as student_name,
        subjects.subject_name,
        subjects.subject_code,
        marks.internal_marks,
        marks.external_marks
      FROM marks
      JOIN students ON marks.student_id = students.id
      JOIN users ON students.user_id = users.id
      JOIN subjects ON marks.subject_id = subjects.id
      WHERE marks.subject_id = ?`,
      [subjectId]
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching marks by subject!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get All Marks
export const getAllMarks = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        marks.id as marks_id,
        students.roll_no,
        users.name as student_name,
        subjects.subject_name,
        marks.internal_marks,
        marks.external_marks
      FROM marks
      JOIN students ON marks.student_id = students.id
      JOIN users ON students.user_id = users.id
      JOIN subjects ON marks.subject_id = subjects.id`
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching all marks!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Delete Marks
export const deleteMarks = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query(`DELETE FROM marks WHERE id = ?`, [id]);
    await connection.commit();

    res.status(200).json({ message: "Marks record deleted successfully." });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      error: "Error deleting marks!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};
