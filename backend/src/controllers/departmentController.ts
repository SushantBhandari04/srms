import type { Request, Response } from "express";
import pool from "../config/db.js";

/**
 * Create a new department
 * Admin only
 */
export const createDepartment = async (req: Request, res: Response) => {
  const { dept_name, dept_code } = req.body;

  if (!dept_name || !dept_code) {
    return res.status(400).json({ error: "Department name and code are required." });
  }

  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      `INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)`,
      [dept_name, dept_code]
    );

    return res.status(201).json({
      message: "Department created successfully.",
      departmentId: result.insertId,
    });
  } catch (error: any) {
    console.error("Error creating department:", error);
    return res.status(500).json({
      error: "Error creating department!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Get a department by ID
 * Accessible by admin, faculty, student
 */
export const getDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(`SELECT * FROM departments WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Department not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching department!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all departments
 * Accessible by admin, faculty, student
 */
export const getAllDepartments = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(`SELECT * FROM departments`);
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Error fetching departments!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Update a department
 * Admin only
 */
export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dept_name, dept_code } = req.body;

  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      `UPDATE departments SET dept_name = ?, dept_code = ? WHERE id = ?`,
      [dept_name, dept_code, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Department not found." });
    }

    res.status(200).json({ message: "Department updated successfully." });
  } catch (error: any) {
    res.status(500).json({
      error: "Error updating department!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete a department
 * Admin only
 */
export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(`DELETE FROM departments WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Department not found." });
    }

    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error: any) {
    res.status(500).json({
      error: "Error deleting department!",
      details: error.message,
    });
  } finally {
    connection.release();
  }
};
