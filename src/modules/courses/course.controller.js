import Course from "./course.model.js";
import { APIError } from "../../utils/errorClass.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { logger } from "../../utils/logger.js";
import User from "../users/user.model.js";
const courseLogger = logger.child({
  logIdentifier: "Auth Controller",
});

export const createCourse = catchAsync(async (req, res) => {
  const { title, description, category, skillLevel } = req.body;
  const userId = req.userId;

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
    createdBy: userId,
  });

  courseLogger.info("Course created successfully", { courseId: course._id });
  return res.status(201).json({ status: true, data: { course } });
});

export const getCourses = catchAsync(async (req, res) => {
  const { category, skillLevel } = req.query;
  const filters = {};
  if (category) {
    filters.category = category;
  }
  if (skillLevel) {
    filters.skillLevel = skillLevel;
  }

  const courses = await Course.find(filters)
    .populate("createdBy", "username role")
    .sort({ createdAt: -1 });
  if (!courses || courses.length === 0) {
    courseLogger.error("No courses found");
    throw new APIError("No courses found", 404);
  }

  const totalResult = courses.length;
  courseLogger.info("Courses retrieved successfully", {
    count: totalResult,
  });

  return res.status(200).json({ status: true, totalResult, data: { courses } });
});

export const enrollCourse = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;
  if (!courseId) throw APIError("No Course selected", 400);

  const course = await Course.findById(courseId);

  if (!course) throw APIError("No Course found", 400);

  const user = await User.findById(userId).populate("enrolledCourses");
  if (!user) throw APIError("User not found", 404);

  if (user.enrolledCourses.some((course) => course._id.equals(courseId))) {
    courseLogger.warn("Already enrolled in this course", {
      userId,
      courseId,
    });
    return res.status(400).json({
      status: false,
      message: "Already enrolled in this course",
    });
  }
  user.enrolledCourses.push(courseId);
  course.enrolledStudents.push(userId);
  await user.save();
  await course.save();

  courseLogger.info("User enrolled in course", {
    userId,
    courseId,
  });
  res.status(200).json({
    status: true,
    message: `Successfully enrolled in ${course.title}`,
    data: { course },
  });
});

export const unEnrollCourse = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;
  if (!courseId) throw APIError("No Course selected", 400);

  const course = await Course.findById(courseId);

  if (!course) throw APIError("No Course found", 400);

  const user = await User.findById(userId).populate("enrolledCourses");
  if (!user) throw APIError("User not found", 404);

  if (!user.enrolledCourses.some((course) => course._id.equals(courseId))) {
    courseLogger.warn("Not enrolled in this course", {
      userId,
      courseId,
    });
    return res.status(400).json({
      status: false,
      message: "Not enrolled in this course",
    });
  }
  user.enrolledCourses.pull(courseId);
  course.enrolledStudents.pull(userId);
  await user.save();
  await course.save();

  courseLogger.info("User unenrolled from course", {
    userId,
    courseId,
  });
  res.status(200).json({
    status: true,
    message: `Successfully unenrolled from ${course.title}`,
    data: { course },
  });
});

export const getEnrolledCourses = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).populate("enrolledCourses");

  if (!user) throw APIError("User not found", 404);

  if (user.enrolledCourses.length === 0) {
    return res.status(200).json({
      status: true,
      message: "No enrolled courses",
      data: { courses: [] },
    });
  }

  courseLogger.info("Enrolled courses retrieved successfully", {
    userId,
    count: user.enrolledCourses.length,
  });

  return res.status(200).json({
    status: true,
    data: {
      status: true,
      count: user.enrolledCourses.length,
      courses: user.enrolledCourses,
    },
  });
});
