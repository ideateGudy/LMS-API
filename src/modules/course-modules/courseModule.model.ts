import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Interface for CourseModule document
interface ICourseModule extends Document {
  courseId: Types.ObjectId;
  moduleNumber: number;
  public: boolean;
  title: string;
  content: string;
  videoUrl?: string;
  resources: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for CourseModule model
interface ICourseModuleModel extends Model<ICourseModule> {
  // You can add static methods here if needed
}

const courseModuleSchema = new Schema<ICourseModule, ICourseModuleModel>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    moduleNumber: { type: Number, required: true },
    public: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    videoUrl: { type: String, trim: true },
    resources: [{ type: String, trim: true }],
    notes: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Create and export the model
const CourseModule = mongoose.model<ICourseModule, ICourseModuleModel>(
  "CourseModule", 
  courseModuleSchema
);

export default CourseModule;