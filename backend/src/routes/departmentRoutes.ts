import { Router } from "express";
import {
  createDepartment,
  getDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Create department (Admin only)
router.post("/", authMiddleware(["admin"]), createDepartment);

// Get all departments (Admin, Faculty, Student)
router.get("/", authMiddleware(["admin", "faculty", "student"]), getAllDepartments);

// Get single department by ID (Admin, Faculty, Student)
router.get("/:id", authMiddleware(["admin", "faculty", "student"]), getDepartment);

// Update department (Admin only)
router.put("/:id", authMiddleware(["admin"]), updateDepartment);

// Delete department (Admin only)
router.delete("/:id", authMiddleware(["admin"]), deleteDepartment);

export default router;
