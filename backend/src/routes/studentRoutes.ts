import { Router } from "express";
import { createStudent, getStudent, getAllStudents, updateStudent, deleteStudent } from "../controllers/studentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(['admin']), createStudent);
router.get("/", authMiddleware(['admin', 'faculty', 'student']), getAllStudents);
router.get("/:id", authMiddleware(['admin', 'faculty', 'student']), getStudent);
router.put("/:id", authMiddleware(['admin']), updateStudent);
router.delete("/:id", authMiddleware(['admin']), deleteStudent);

export default router;
