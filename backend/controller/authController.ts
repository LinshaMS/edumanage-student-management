import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Admin login
export const loginAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Authentication is not configured",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Unable to log in",
    });
  }
};

// Change admin password
export const changePassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        message: "New password must be at least 12 characters.",
      });
    }

    // The auth middleware attaches adminId to the request.
    const adminId = (
      req as Request & { adminId?: string }
    ).adminId;

    if (!adminId) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      admin.passwordHash
    );

    if (samePassword) {
      return res.status(400).json({
        message: "Your new password must differ from your current password.",
      });
    }

    // Hash the new password before saving it.
    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Unable to change password.",
    });
  }
};