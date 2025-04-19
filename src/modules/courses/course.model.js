import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: { type: String, trim: true, default: "1 hour " },

    prerequisites: [{ type: String, trim: true }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

courseSchema.index({ title: 1, category: 1, skillLevel: 1 });

courseSchema.virtual("summary").get(function () {
  return `${this?.title} - ${this?.skillLevel} (${this?.duration})`;
});

export default mongoose.model("Course", courseSchema);
