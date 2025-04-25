import Course from "./course.model.js";
import User from "../users/user.model.js";
import { APIError } from "../../utils/errorClass.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { logger } from "../../utils/logger.js";
const courseLogger = logger.child({
  logIdentifier: "Auth Controller",
});

export const createCourse = catchAsync(async (req, res) => {
  const { title, description, category, skillLevel, prerequisites } = req.body;
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

export const getCourses = catchAsync(async (req, res) => {
  const { category, skillLevel } = req.query;
  const filters = {};
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
  courseLogger.info("Courses retrieved successfully", {
    count,
  });

  res.status(200).json({ status: true, count, data: { courses } });
});

export const getCourseById = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  console.log(courseId, course);
  if (!course) {
    courseLogger.error("No course found");
    throw new APIError("No course found", 404);
  }

  res.status(200).json({ status: true, data: { course } });
});

export const getMyCourses = catchAsync(async (req, res) => {
  const userId = req.userId;
  console.log("userid-----------------", userId);

  const courses = await Course.find(userId);
  console.log("courses-----------------", courses);

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
