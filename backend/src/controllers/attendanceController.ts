import type { Request, Response } from "express";
import pool from "../config/db.js";

// ✅ Mark Attendance
export const markAttendance = async (req: Request, res: Response) => {
  const { studentId, subjectId, date, status } = req.body; // status: 'Present' or 'Absent'

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result]: any = await connection.query(
      `INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)`,
      [studentId, subjectId, date, status]
    );

    await connection.commit();

    res.status(200).json({
      message: "Attendance marked successfully.",
      attendanceId: result.insertId,
    });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      error: "Error marking attendance!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get Attendance by Student
export const getAttendanceByStudent = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        attendance.id as attendance_id,
        students.id as student_id,
        students.roll_no,
        users.name as student_name,
        subjects.subject_name,
        subjects.subject_code,
        attendance.date,
        attendance.status
      FROM attendance
      JOIN students ON attendance.student_id = students.id
      JOIN users ON students.user_id = users.id
      JOIN subjects ON attendance.subject_id = subjects.id
      WHERE students.id = ?`,
      [studentId]
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching attendance by student!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get Attendance by Subject
export const getAttendanceBySubject = async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        attendance.id as attendance_id,
        students.roll_no,
        users.name as student_name,
        subjects.subject_name,
        attendance.date,
        attendance.status
      FROM attendance
      JOIN students ON attendance.student_id = students.id
      JOIN users ON students.user_id = users.id
      JOIN subjects ON attendance.subject_id = subjects.id
      WHERE subjects.id = ?`,
      [subjectId]
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching attendance by subject!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get All Attendance
export const getAllAttendance = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        attendance.id as attendance_id,
        students.roll_no,
        users.name as student_name,
        subjects.subject_name,
        attendance.date,
        attendance.status
      FROM attendance
      JOIN students ON attendance.student_id = students.id
      JOIN users ON students.user_id = users.id
      JOIN subjects ON attendance.subject_id = subjects.id
      ORDER BY attendance.date DESC`
    );

    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching attendance records!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Delete Attendance
export const deleteAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM attendance WHERE id = ?`, [id]);

    await connection.commit();
    res.status(200).json({ message: "Attendance record deleted successfully." });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      error: "Error deleting attendance!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};
