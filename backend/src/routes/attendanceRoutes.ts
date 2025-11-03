import express from "express";
import {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceBySubject,
    getAllAttendance,
    deleteAttendance
} from "../controllers/attendanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Mark attendance (create)
router.post("/", authMiddleware(['faculty']), markAttendance);

// Get attendance by student ID
router.get("/student/:studentId", authMiddleware(['admin', 'faculty', 'student']), getAttendanceByStudent);

// Get attendance by subject ID
router.get("/subject/:subjectId", authMiddleware(['admin', 'faculty', 'student']), getAttendanceBySubject);

// Get all attendance records
router.get("/", authMiddleware(['admin', 'faculty']), getAllAttendance);

// Delete attendance record
router.delete("/:id", authMiddleware(['admin']), deleteAttendance);

export default router;
