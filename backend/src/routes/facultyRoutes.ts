import { Router } from "express";
import { createFaculty, updateFaculty, deleteFaculty, getAllFaculties, getFaculty } from "../controllers/facultyController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(['admin']), createFaculty);
router.get("/", authMiddleware(['admin', 'faculty']), getAllFaculties);
router.get("/:id", authMiddleware(['admin', 'faculty']), getFaculty);
router.put("/:id", authMiddleware(['admin']), updateFaculty);
router.delete("/:id", authMiddleware(['admin']), deleteFaculty);

export default router;
