import { Request, Response } from 'express';
import Course from "./course.model";
import User from "../users/user.model";
import { APIError } from "../../utils/errorClass";
import { catchAsync } from "../../utils/catchAsync";
import { logger } from "../../utils/logger";

const courseLogger = logger.child({
  logIdentifier: "Course Controller",
});

interface ICourseRequest extends Request {
  userId?: string;
}

interface ICourseBody {
  title: string;
  description: string;
  category: string;
  skillLevel: string;
  prerequisites?: string[];
}

interface ICourseQuery {
  category?: string;
  skillLevel?: string;
}

export const createCourse = catchAsync(async (req: ICourseRequest, res: Response) => {
  const { title, description, category, skillLevel, prerequisites } = req.body as ICourseBody;
  const userId = req.userId;

  if (!userId) throw new APIError("User not found", 404);

  const user = await User.findById(userId);
  if (!user) throw new APIError("User not found", 404);

  if (!title || !description || !category || !skillLevel) {
    courseLogger.warn("All fields are required");
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  const course = await Course.create({
    title,
    description,
    category,
    skillLevel,
    prerequisites,
    createdBy: userId,
  });

  courseLogger.info("Course created successfully", { courseId: course._id });
  return res.status(201).json({ status: true, data: { course } });
});

export const getCourses = catchAsync(async (req: Request<{}, {}, {}, ICourseQuery>, res: Response) => {
  const { category, skillLevel } = req.query;
  const filters: Record<string, any> = {};
  
  if (category) filters.category = category;
  if (skillLevel) filters.skillLevel = skillLevel;

  const courses = await Course.find(filters)
    .populate("createdBy", "username role")
    .sort({ createdAt: -1 });
  
  if (!courses || courses.length === 0) {
    courseLogger.error("No courses found");
    throw new APIError("No courses found", 404);
  }

  const count = courses.length;
  courseLogger.info("Courses retrieved successfully", { count });

  res.status(200).json({ status: true, count, data: { courses } });
});

export const getCourseById = catchAsync(async (req: Request<{ courseId: string }>, res: Response) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    courseLogger.error("No course found");
    throw new APIError("No course found", 404);
  }

  res.status(200).json({ status: true, data: { course } });
});

export const getMyCourses = catchAsync(async (req: ICourseRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new APIError("User not found", 404);

  const courses = await Course.find({ createdBy: userId });
  if (!courses) throw new APIError("No course found", 404);
  
  if (courses.length === 0) {
    return res.status(200).json({
      status: true,
      message: "You have not created any course yet",
      data: { courses: [] },
    });
  }

  res.status(200).json({
    status: true,
    message: "Courses fetched successfully",
    data: { courses },
  });
});