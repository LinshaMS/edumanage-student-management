import { Router } from "express";
import {
  createCourse,
  getCourses,
  deleteCourse,
} from "../controller/courseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// View courses
router.get("/api/courses", getCourses);

// Admin-only operations
router.post("/api/courses", authMiddleware, createCourse);
router.delete("/api/courses/:id", authMiddleware, deleteCourse);

export default router;