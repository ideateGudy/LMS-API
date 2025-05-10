import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../config/winston.js";

const progressLogger = logger.child({
  logIdentifier: "Progress Controller",
});

import {
  updateCourseProgress,
  updateLessonCompletion,
} from "../services/progress.service.js";
import { getEnrolledCourses_S } from "../services/user.service.js";

// Handler for updating course progress
const updateCourseProgressHandler = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.body;

  if (!courseId) {
    progressLogger.error("Course ID is required", {
      userId,
    });
    return res
      .status(400)
      .json({ success: false, message: "Course ID is required" });
  }

  //Check if user is enrolled in the course
  const courses = await getEnrolledCourses_S(userId);

  if (!courses || courses.length === 0) {
    progressLogger.error("No enrolled courses found", {
      userId,
    });
    return res
      .status(404)
      .json({ success: false, message: "No enrolled courses found" });
  }

  // Check if the user is enrolled in the course
  const enrolled = courses.some((course) => course.id === courseId);
  if (!enrolled) {
    progressLogger.error("User not enrolled in this course", {
      userId,
      courseId,
    });
    return res
      .status(403)
      .json({ success: false, message: "User not enrolled in this course" });
  }

  const courseProgress = await updateCourseProgress(userId, courseId);

  if (courseProgress === 0) {
    progressLogger.error("Course progress is 0", {
      userId,
      courseId,
    });
    return res.status(200).json({
      success: true,
      message: "Course progress is 0",
      courseProgress,
    });
  }

  if (!courseProgress) {
    progressLogger.error("Course progress not found", {
      userId,
      courseId,
    });
    return res
      .status(404)
      .json({ success: false, message: "Course progress not found" });
  }

  res.status(200).json({
    success: true,
    message: "Course progress updated",
    courseProgress,
  });
});

// Handler for updating lesson completion and recalculating progress
const updateLessonCompletionHandler = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { lessonId, completed } = req.body;

  const { moduleProgress, courseProgress, congrats } =
    await updateLessonCompletion(userId, lessonId, completed);

  if (moduleProgress === 0 || courseProgress === 0) {
    progressLogger.error("Module or course progress is 0", {
      userId,
      lessonId,
    });
    return res.status(200).json({
      success: true,
      message: "Module or course progress is 0",
      moduleProgress,
      courseProgress,
    });
  }

  if (!moduleProgress || !courseProgress) {
    progressLogger.error("Module or course progress not found", {
      userId,
      lessonId,
    });
    return res
      .status(404)
      .json({ success: false, message: "Module or course progress not found" });
  }

  res.status(200).json({
    success: true,
    message: "Lesson completion updated and progress recalculated",
    moduleProgress,
    courseProgress,
    congrats,
  });
});

export { updateCourseProgressHandler, updateLessonCompletionHandler };
