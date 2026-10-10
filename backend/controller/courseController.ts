
import { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Student from "../models/Student.js";

// CREATE a course
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body ?? {};

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Course name is required",
            });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({
                message: "Course name cannot exceed 100 characters",
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "Course description must be a string",
            });
        }

        const normalizedName = name.trim();
        const normalizedDescription =
            typeof description === "string" ? description.trim() : "";

        if (normalizedDescription.length > 500) {
            return res.status(400).json({
                message: "Course description cannot exceed 500 characters",
            });
        }

        const existingCourse = await Course.findOne({
            name: normalizedName,
        });

        if (existingCourse) {
            return res.status(409).json({
                message: "This course already exists",
            });
        }

        const course = await Course.create({
            name: normalizedName,
            description: normalizedDescription,
        });

        return res.status(201).json({
            message: "Course created successfully",
            course,
        });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return res.status(409).json({
                message: "This course already exists",
            });
        }

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Course validation failed",
                errors: Object.values(error.errors).map(
                    (item) => item.message
                ),
            });
        }

        console.error("Create course error:", error);

        return res.status(500).json({
            message: "An unexpected error occurred while creating the course",
        });
    }
};

// GET all courses with student enrollment counts
export const getCourses = async (_req: Request, res: Response) => {
    try {
        const courses = await Course.find().sort({ name: 1 });

        const coursesWithCounts = await Promise.all(
            courses.map(async (course) => {
                const studentCount = await Student.countDocuments({
                    course: course.name,
                });

                return {
                    ...course.toObject(),
                    studentCount,
                };
            })
        );

        return res.status(200).json(coursesWithCounts);
    } catch (error) {
        console.error("Get courses error:", error);

        return res.status(500).json({
            message: "An unexpected error occurred while fetching courses",
        });
    }
};

// DELETE a course only when no students are enrolled
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        const studentCount = await Student.countDocuments({
            course: course.name,
        });

        if (studentCount > 0) {
            return res.status(409).json({
                message: "Cannot delete a course with enrolled students",
            });
        }

        await course.deleteOne();

        return res.status(200).json({
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.error("Delete course error:", error);

        return res.status(500).json({
            message: "An unexpected error occurred while deleting the course",
        });
    }
};
