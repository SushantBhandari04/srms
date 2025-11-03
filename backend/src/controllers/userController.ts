import pool from "../config/db.js";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const connection = await pool.getConnection();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await pool.query(`INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`, [name, email, hashedPassword, role]);
        return res.status(201).json({
            message: "User created successfully.",
            userId: result.insertedId
        })
    } catch (error: any) {
        return res.status(400).json({
            error: `Error creating user!`,
            details: error.message
        })
    } finally {
        connection.release();
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(`SELECT id, name, email, role, created_at FROM users`);
        return res.status(201).json({
            users: rows
        });
    } catch (error: any) {
        res.status(400).json({
            error: "Error fetching users!",
            details: error.message
        })
    } finally {
        connection.release();
    }
}



