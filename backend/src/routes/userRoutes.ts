import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(['admin']), createUser);
router.get("/", authMiddleware(['admin']), getAllUsers);

export default router;
