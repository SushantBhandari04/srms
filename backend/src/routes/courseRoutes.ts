import { Router } from "express";
import { createCourse, updateCourse, deleteCourse, getAllCourses, getCourse } from "../controllers/courseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(['admin']), createCourse);
router.get("/", authMiddleware(['admin', 'faculty', 'student']), getAllCourses);
router.get("/:id", authMiddleware(['admin', 'faculty', 'student']), getCourse);
router.put("/:id", authMiddleware(['admin']), updateCourse);
router.delete("/:id", authMiddleware(['admin']), deleteCourse);

export default router;
