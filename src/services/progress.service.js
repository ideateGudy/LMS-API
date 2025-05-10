import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";

const progressLogger = logger.child({
  logIdentifier: "Progress Controller",
});

// Calculate module progress (average of lesson progress)
const calculateModuleProgress = async (moduleId) => {
  // Fetch all lessons for the module
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
  });

  // Check if there are no lessons in the module
  if (!lessons || lessons.length === 0) {
    progressLogger.error("No lessons found for this module", {
      moduleId,
    });
    throw new APIError("No lessons found for this module", 404);
  }

  // Calculate the lesson progress (100 if completed, 0 if not)
  const lessonProgress = lessons.map((lesson) => (lesson.completed ? 100 : 0));

  // Calculate the module progress as the average of all lesson progress
  const moduleProgress = lessonProgress.length
    ? lessonProgress.reduce((a, b) => a + b, 0) / lessons.length
    : 0;

  return moduleProgress;
};

// Calculate course progress (average of module progress)
const calculateCourseProgress = async (courseId) => {
  // Fetch all modules for the course
  const modules = await prisma.module.findMany({
    where: { courseId },
  });

  // Check if there are no modules in the course
  if (!modules || modules.length === 0) {
    progressLogger.error("No modules found for this course", {
      courseId,
    });
    throw new APIError("No modules found for this course", 404);
  }

  // Calculate the progress for each module
  const moduleProgressValues = [];
  for (const module of modules) {
    const moduleProgress = await calculateModuleProgress(module.id);
    moduleProgressValues.push(moduleProgress);
  }

  // Calculate the course progress as the average of all module progress
  const courseProgress = moduleProgressValues.length
    ? moduleProgressValues.reduce((a, b) => a + b, 0) / modules.length
    : 0;

  return courseProgress;
};

// Update course progress (after a module or lesson is completed)
const updateCourseProgress = async (userId, courseId) => {
  const courseProgress = await calculateCourseProgress(courseId);

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { progress: courseProgress },
    create: { userId, courseId, progress: courseProgress },
  });

  return courseProgress;
};

// Update module progress
const updateModuleProgress = async (userId, moduleId) => {
  const moduleProgress = await calculateModuleProgress(moduleId);

  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: { progress: moduleProgress },
    create: { userId, moduleId, progress: moduleProgress },
  });

  return moduleProgress;
};

// Update lesson completion and recalculate related progress
const updateLessonCompletion = async (userId, lessonId, completed) => {
  // Get the related module and course IDs
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      title: true,
      completed: true,
      moduleId: true,
      module: {
        select: {
          id: true,
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    progressLogger.error("Lesson not found", {
      lessonId,
    });
    throw new APIError("Lesson not found", 404);
  }
  const moduleId = lesson.moduleId;
  const courseId = lesson.module.courseId;

  // Check if user is enrolled in the course
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      enrolledCourses: {
        select: { id: true },
      },
    },
  });

  const checkIsEnrolled = user?.enrolledCourses.find(
    (course) => course.id === courseId
  );
  if (!checkIsEnrolled) {
    progressLogger.error("User not enrolled in this course", {
      userId,
      courseId,
    });
    throw new APIError("User not enrolled in this course", 403);
  }

  // Update the lesson completion status
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { completed },
  });

  // Recalculate the progress for the module and course
  const moduleProgress = await updateModuleProgress(userId, moduleId);
  const courseProgress = await updateCourseProgress(userId, courseId);

  let update;
  //Check if course progress is 100
  if (courseProgress === 100) {
    update = await prisma.course.update({
      where: { id: courseId },
      data: { completed: true },
    });
  } else {
    await prisma.course.update({
      where: { id: courseId },
      data: { completed: false },
    });
  }

  const congrats = update ? update.congratulationsMessage : undefined;

  return { moduleProgress, courseProgress, congrats };
};

export { updateCourseProgress, updateLessonCompletion };
