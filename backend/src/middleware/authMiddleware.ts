import type { NextFunction } from "express";
import pool from "../config/db.js";
import type { Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface AuthRequest extends Request {
    userId?: number;
}

export const authMiddleware = (roles: string[] = []) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1]; // expects "Bearer <token>"

        if (!token) {
            return res.status(401).json({ error: "Access token missing!" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123") as JwtPayload;
            const userRole = decoded.user?.role || decoded.role;
            
            if (roles.length && !roles.includes(userRole)) {
                return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            }

            (req as any).user = decoded.user || decoded;
            next();

        } catch (err: any) {
            return res.status(401).json({ error: "Invalid or expired token!" });
        }
    }
}
