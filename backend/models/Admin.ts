
import mongoose, { Document, Schema, model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IAdmin>("Admin", adminSchema);
