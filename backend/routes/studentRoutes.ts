
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
} from "../controller/studentController.js";

const router = express.Router();

router.post("/api/students", authMiddleware, createStudent);
router.get("/api/students", authMiddleware, getStudents);
router.put("/api/students/:id", authMiddleware, updateStudent);
router.delete("/api/students/:id", authMiddleware, deleteStudent);

export default router;
