import { Request, Response } from 'express';
import { catchAsync } from "../../utils/catchAsync";
import Progress from "./progress.model"; // Remove IProgress from import

// Define IProgress interface locally since it's not exported from the model
interface IProgress {
  _id: any;
  student: any;
  course: any;
  percentage: number;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Non-generic AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface IProgressResponse {
  status: boolean;
  message?: string;
  count?: number;
  data?: {
    progress?: IProgress | IProgress[];
  };
}

export const getAllProgress = catchAsync(async (req: AuthenticatedRequest, res: Response<IProgressResponse>) => {
  const progress = await Progress.find({ student: req.userId }).populate(
    "course",
    "title description"
  );

  if (!progress || progress.length === 0) {
    return res
      .status(404)
      .json({ status: false, message: "No progress found" });
  }

  res.status(200).json({
    status: true,
    count: progress.length,
    message: "Fetched Successfully",
    data: { progress },
  });
});

export const getProgressByCourse = catchAsync(async (req: AuthenticatedRequest, res: Response<IProgressResponse>) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({
      status: false,
      message: "Course ID is required",
    });
  }

  const progress = await Progress.findOne({
    student: req.userId,
    course: courseId,
  }).populate("course");

  if (!progress) {
    return res
      .status(404)
      .json({ status: false, message: "No progress found for this course" });
  }

  res.status(200).json({
    status: true,
    message: "Fetched Successfully",
    data: { progress },
  });
});

export const updateProgress = catchAsync(async (req: AuthenticatedRequest, res: Response<IProgressResponse>) => {
  const { percentage } = req.body;
  const { courseId } = req.params;
  const userId = req.userId;

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
    existing.lastUpdated = new Date();
    await existing.save();

    return res.json({
      status: true,
      message: "Progress updated",
      data: { progress: existing },
    });
  }

  const newProgress = await Progress.create({
    student: userId,
    course: courseId,
    percentage,
  });

  res.status(201).json({ 
    status: true, 
    message: "Progress created", 
    data: { progress: newProgress } 
  });
});