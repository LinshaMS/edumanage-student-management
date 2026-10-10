import { Router } from "express";
import {
  loginAdmin,
  changePassword,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Admin login
router.post("/api/auth/login", loginAdmin);

// Change admin password
router.put(
  "/api/auth/change-password",
  authMiddleware,
  changePassword
);

export default router;