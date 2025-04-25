import { catchAsync } from "../../utils/catchAsync.js";
import Progress from "./progress.model.js";

export const getAllProgress = catchAsync(async (req, res) => {
  const progress = await Progress.find({ student: req.userId }).populate(
    "course",
    " title description "
  );

  if (!progress || progress.length === 0) {
    return res
      .status(404)
      .json({ status: false, message: "No progress found" });
  }
  res.status(200).json({
    status: true,
    count: progress.length,
    message: `Fetched Successfully`,
    data: { progress },
  });
});

export const getProgressByCourse = catchAsync(async (req, res) => {
  const courseId = req.params.courseId;
  const progress = await Progress.findOne({
    student: req.userId,
    course: courseId,
  }).populate("course");

  if (!courseId) {
    return res.status(400).json({
      status: false,
      message: "Course ID is required",
    });
  }

  if (!progress) {
    return res
      .status(404)
      .json({ status: false, message: "No progress found for this course" });
  }

  res.status(200).json({
    status: true,
    message: `Fetched Successfully`,
    data: { progress },
  });
});

export const updateProgress = catchAsync(async (req, res) => {
  const { percentage } = req.body;
  const courseId = req.params.courseId;
  const userId = req.userId;
  console.log("User ID:", userId);
  console.log("Course ID:", courseId);
  console.log("Percentage:", percentage);
  if (!percentage) {
    return res.status(400).json({
      status: false,
      message: "Percentage is required",
    });
  }
  if (percentage < 0 || percentage > 100) {
    return res.status(400).json({
      status: false,
      message: "Percentage should be between 0 and 100",
    });
  }
  if (!courseId) {
    return res.status(400).json({
      status: false,
      message: "Course ID is required",
    });
  }

  const existing = await Progress.findOne({
    student: userId,
    course: courseId,
  });
  if (existing) {
    existing.percentage = percentage;
    existing.lastUpdated = Date.now();
    await existing.save();

    return res.json({
      status: true,
      message: "Progress updated",
      progress: existing,
    });
  }

  const newProgress = await Progress.create({
    student: userId,
    course: courseId,
    percentage,
  });
  res
    .status(201)
    .json({ status: true, message: "Progress created", progress: newProgress });
});
