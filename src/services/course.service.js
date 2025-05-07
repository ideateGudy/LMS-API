import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";

const courseServiceLogger = logger.child({
  logIdentifier: "Auth Service",
});

export const createNewCourseService = async (courseData, userId) => {
  const { title, description, category, skillLevel, modules } = courseData;

  if (!userId) throw new APIError("User not found", 404);
  if (!title || !description || !category || !skillLevel || !modules)
    throw new APIError("All fields are required", 400);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new APIError("User not found", 404);

  // Prepare the nested data for modules and lessons
  const nestedModules = modules.map((module) => ({
    title: module.title,
    description: module.description,
    moduleNumber: module.moduleNumber,
    duration: module.duration,
    material: module.material,
    promoVideo: module.promoVideo,
    lessons: {
      create: module.lessons.map((lesson) => ({
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        lessonNumber: lesson.lessonNumber,
        duration: lesson.duration,
        material: lesson.material,
      })),
    },
  }));

  const course = await prisma.course.create({
    data: {
      ...courseData,
      createdBy: userId,
      instructors: {
        connect: { id: userId },
      },
      modules: {
        create: nestedModules, // Use the nested structure here
      },
    },
  });

  if (!course) {
    courseServiceLogger.error("Course creation failed");
    throw new APIError("Course creation failed", 500);
  }
  courseServiceLogger.info("Course created successfully", {
    courseId: course.id,
    userId,
  });

  return course;
};

export const getAllCoursesService = async ({
  category,
  skillLevel,
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filters = {};
  if (category) filters.category = category;
  if (skillLevel) filters.skillLevel = skillLevel;

  const skip = (page - 1) * limit;
  const orderDirection = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";

  const whereClause = {
    ...filters,
    OR: search
      ? [{ title: { contains: search } }, { description: { contains: search } }]
      : undefined,
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      include: {
        instructors: {
          select: { username: true, role: true },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: orderDirection,
      },
    }),
    prisma.course.count({ where: whereClause }),
  ]);

  if (!courses || courses.length === 0) {
    return {
      count: 0,
      pagination: {
        currentPage: page,
        totalPages: 0,
        pageSize: limit,
      },
      courses: [],
    };
  }

  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      currentPage: page,
      totalPages,
      pageSize: limit,
    },
    count: total,
    courses,
  };
};
