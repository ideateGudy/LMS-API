import mongoose, { Schema, Document, Model } from "mongoose";

// Define interface for Course document
interface ICourse extends Document {
  title: string;
  description?: string;
  category?: string;
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
  duration?: string;
  prerequisites?: string[];
  createdBy: mongoose.Types.ObjectId;
  instructors?: mongoose.Types.ObjectId[];
  enrolledStudents?: mongoose.Types.ObjectId[];
  summary: string;
}

// Define interface for Course model
interface ICourseModel extends Model<ICourse> {
  // You can add static methods here if needed
}

const courseSchema = new Schema<ICourse, ICourseModel>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: { type: String, trim: true, default: "1 hour" },
    prerequisites: [{ type: String, trim: true }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

// Indexes
courseSchema.index({ title: 1, category: 1, skillLevel: 1 });

// Virtuals
courseSchema.virtual("summary").get(function (this: ICourse) {
  return `${this.title} - ${this.skillLevel} (${this.duration})`;
});

// Create and export the model
const Course = mongoose.model<ICourse, ICourseModel>("Course", courseSchema);
export default Course;