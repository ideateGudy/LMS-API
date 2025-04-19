import mongoose, { Schema } from "mongoose";

const courseModuleSchema = new Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model("CourseModule", courseModuleSchema);
