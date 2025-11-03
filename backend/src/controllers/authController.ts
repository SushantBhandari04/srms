import type { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).json({
            error: "Email or password missing!"
        })
    }

    const connection = await pool.getConnection();

    try {
        const [rows]: any = await connection.query(`SELECT name, email, id, password, role FROM users WHERE email = ?`, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                error: "No such user exists!"
            })
        }

        const hashedPassword = rows[0].password;
        const user = {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            role: rows[0].role
        };

        const checkPassword = await bcrypt.compare(password, hashedPassword);

        if (!checkPassword) {
            return res.status(401).json({
                error: "Invalid email or password!"
            })
        }

        const token = await jwt.sign({user}, process.env.JWT_SECRET || "secret123");

        return res.status(200).json({
            message: "Logged in successfully!",
            token
        })
    } catch (error: any) {
        return res.status(500).json({
            error: "Login failed",
            details: error.message
        })
    } finally {
        connection.release();
    }
}