import { APIError } from "../utils/errorClass.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../config/winston.js";
import {
  createNewCourseService,
  getAllCoursesService,
} from "../services/course.service.js";
const courseLogger = logger.child({
  logIdentifier: "Auth Controller",
});

export const createCourse = catchAsync(async (req, res) => {
  const userId = req.userId;
  const courseData = req.body;

  const course = await createNewCourseService(courseData, userId);
  if (!course) {
    courseLogger.error("Course creation failed", { userId });
    throw new APIError("Course creation failed", 500);
  }

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: { course },
  });
});

export const getCourses = catchAsync(async (req, res) => {
  const {
    category,
    skillLevel,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const result = await getAllCoursesService({
    category,
    skillLevel,
    search,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  if (result.count === 0) {
    return res.status(200).json({
      success: true,
      message: "No course found",
      data: { courses: [] },
    });
  }

  res.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    data: result,
  });
});

export const getCourseById = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructors: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          profilePicture: true,
        },
      },
      modules: {
        select: {
          id: true,
          title: true,
          moduleNumber: true,
          description: true,
          lessons: {
            select: {
              id: true,
              title: true,
              lessonNumber: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!course) throw new APIError("No course found", 404);

  res.status(200).json({ success: true, data: { course } });
});

export const getMyCourses = catchAsync(async (req, res) => {
  const userId = req.userId;
  // const courses = await prisma.course.findMany({
  //   where: {
  //     createdBy: userId,
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  // });

  const {
    category,
    skillLevel,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const result = await getAllCoursesService(
    {
      category,
      skillLevel,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    },
    userId
  );

  if (result.count === 0) {
    return res.status(200).json({
      success: true,
      message: "You have not created any course yet",
      data: { courses: [] },
    });
  }

  res.status(200).json({
    success: true,
    message: "Courses fetched successfully",
    data: { count: result.length, result },
  });
});
