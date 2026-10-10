import { Request, Response } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";

// Validate email format
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// CREATE a student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, course } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof course !== "string" ||
      !course.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, and course are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCourse = course.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name must contain 2–100 characters",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (normalizedCourse.length > 100) {
      return res.status(400).json({
        message: "Course name cannot exceed 100 characters",
      });
    }

    const existingStudent = await Student.findOne({
      email: normalizedEmail,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "A student with this email already exists",
      });
    }

    const student = await Student.create({
      name: normalizedName,
      email: normalizedEmail,
      course: normalizedCourse,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: "A student with this email already exists",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Student validation failed",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Create student error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while creating the student",
    });
  }
};

// READ students with pagination, search, filtering and sorting
export const getStudents = async (req: Request, res: Response) => {
  try {
    const hasQueryParameters = [
      "page",
      "limit",
      "search",
      "course",
      "sortBy",
      "order",
    ].some((key) => req.query[key] !== undefined);

    // Preserve compatibility with existing requests that expect an array,
    // such as the dashboard in App.tsx.
    if (!hasQueryParameters) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.status(200).json(students);
    }

    const parsedPage = Number(req.query.page ?? 1);
    const parsedLimit = Number(req.query.limit ?? 5);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1 ||
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1
    ) {
      return res.status(400).json({
        message: "Page and limit must be positive integers",
      });
    }

    const page = parsedPage;
    const limit = Math.min(parsedLimit, 100);

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const course =
      typeof req.query.course === "string" ? req.query.course.trim() : "";

    const requestedSortBy =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";

    const sortBy = ["name", "email", "createdAt"].includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";

    const requestedOrder =
      typeof req.query.order === "string" ? req.query.order : "desc";

    const order = requestedOrder === "asc" ? 1 : -1;

    // Build the MongoDB filter.
    const filter: Record<string, unknown> = {};

    if (search) {
      // Escape special regex characters supplied by the user.
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (course) {
      filter.course = course;
    }

    // Count matching students before applying pagination.
    const totalStudents = await Student.countDocuments(filter);

    const totalPages = Math.ceil(totalStudents / limit);
    const currentPage =
      totalPages === 0 ? 1 : Math.min(page, totalPages);

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: order as 1 | -1,
      _id: order as 1 | -1,
    };

    const students = await Student.find(filter)
      .sort(sortOptions)
      .skip((currentPage - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      students,
      pagination: {
        totalStudents,
        totalPages,
        currentPage,
        limit,
      },
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while fetching students",
    });
  }
};

// UPDATE a student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, course } = req.body ?? {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof course !== "string" ||
      !course.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, and course are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCourse = course.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name must contain 2–100 characters",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (normalizedCourse.length > 100) {
      return res.status(400).json({
        message: "Course name cannot exceed 100 characters",
      });
    }

    const existingStudent = await Student.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Another student already uses this email",
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      {
        name: normalizedName,
        email: normalizedEmail,
        course: normalizedCourse,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: "A student with this email already exists",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Student validation failed",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Update student error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while updating the student",
    });
  }
};

// DELETE a student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while deleting the student",
    });
  }
};