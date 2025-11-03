import express from "express";
import {
    addMarks,
    updateMarks,
    getMarksByStudent,
    getMarksBySubject,
    getAllMarks,
    deleteMarks
} from "../controllers/marksController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add marks
router.post("/", authMiddleware(['faculty']), addMarks);

// Update marks
router.put("/:id", authMiddleware(['faculty']), updateMarks);

// Get marks by student ID
router.get("/student/:studentId", authMiddleware(['admin', 'student', 'faculty']), getMarksByStudent);

// Get marks by subject ID
router.get("/subject/:subjectId", authMiddleware(['admin', 'faculty', 'student']), getMarksBySubject);

// Get all marks
router.get("/", authMiddleware(['admin', 'faculty']), getAllMarks);

// Delete marks
router.delete("/:id", authMiddleware(['faculty']), deleteMarks);

export default router;
