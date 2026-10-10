
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Course name is required"],
            trim: true,
            unique: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
