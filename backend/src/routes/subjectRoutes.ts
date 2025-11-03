import { Router } from "express";
import { createSubject, updateSubject, deleteSubject, getAllSubjects, getSubject, assignFacultyToSubject } from "../controllers/subjectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(['admin']), createSubject);
router.get("/", authMiddleware(['admin', 'faculty', 'student']), getAllSubjects);
router.get("/:id", authMiddleware(['admin', 'faculty', 'student']), getSubject);
router.put("/assign-faculty", authMiddleware(['admin']), assignFacultyToSubject);
router.put("/:id", authMiddleware(['admin']), updateSubject);
router.delete("/:id", authMiddleware(['admin']), deleteSubject);

export default router;