import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!mongoUri || !email || !password) {
      throw new Error(
        "Missing MONGO_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env"
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    await mongoose.connect(mongoUri);

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists:", email);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Admin.create({
      email,
      passwordHash,
    });

    console.log("Admin account created successfully!");
    console.log("Login email:", email);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

void createAdmin();