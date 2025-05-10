import { catchAsync } from "../utils/catchAsync.js";
// import { APIError } from "../utils/errorClass.js";
import { logger } from "../config/winston.js";
// import prisma from "../lib/prismaClient.js";
import {
  changePassword_S,
  deleteUser_S,
  enrollCourse_S,
  getAllUserData_S,
  getAllUsers_S,
  getEnrolledCourses_S,
  unenrollCourse_S,
  updateUserInfo_S,
} from "../services/user.service.js";
import { APIError } from "../utils/errorClass.js";
import { createUser_S } from "../services/auth.service.js";
const userLogger = logger.child({
  logIdentifier: "User Controller",
});

export const getUser = catchAsync(async (req, res) => {
  const userId = req.userId;

  const user = await getAllUserData_S(userId);

  userLogger.info("User retrieved successfully", { userId });
  res.status(200).json({ success: true, data: { user } });
});

export const getUsers = catchAsync(async (req, res) => {
  // Destructuring query parameters from the request
  const {
    username,
    email,
    role,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "email",
    sortOrder = "asc",
    isDeactivated,
  } = req.query;

  let check = isDeactivated;
  if (check === "true") {
    check = true;
  } else if (check === "false") {
    check = false;
  }

  // Construct filters object from known query fields
  const filters = {};
  if (username) filters.username = username;
  if (email) filters.email = email;
  if (role) filters.role = role;
  if (isDeactivated !== "") filters.isDeactivated = check;

  // Call the service with pagination, filters, sorting, and search
  const result = await getAllUsers_S({
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    search,
    filters,
  });

  // If no users found
  if (result.users.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No user found",
      data: { users: [] },
    });
  }

  const users = result.users;

  // Success response with paginated data
  return res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: {
      pagination: {
        currentPage: result.page,
        limit: parseInt(limit),
        pageSize: result.users.length,
        totalPages: result.totalPages,
      },
      count: result.total,
      users,
    },
  });
});

export const enrollCourse = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;
  if (!courseId) throw new APIError("No Course selected", 400);

  const course = await enrollCourse_S(userId, courseId);

  res.status(200).json({
    success: true,
    message: `Successfully enrolled in ${course.title}`,
    data: { course },
  });
});

export const unEnrollCourse = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;
  if (!courseId) throw new APIError("No Course selected", 400);

  const course = await unenrollCourse_S(userId, courseId);

  res.status(200).json({
    success: true,
    message: `Successfully unenrolled from ${course.title}`,
    data: { course },
  });
});

export const getEnrolledCourses = catchAsync(async (req, res) => {
  const userId = req.userId;

  const courses = await getEnrolledCourses_S(userId);

  if (courses.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No enrolled courses",
      data: { courses: [] },
    });
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    data: {
      courses,
    },
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { id, role, password, ...restData } = req.body;

  // Ccheck if user is trying to update id, role or password
  if (id || role || password) {
    throw new APIError("You cannot update id, role or password", 400);
  }

  const updatedUser = await updateUserInfo_S(userId, restData);

  userLogger.info("User updated successfully", { userId });
  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: { updatedUser },
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const userId = req.userId;
  const reqBody = req.body;

  await changePassword_S(reqBody, userId);

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { userId, username, email } = req.query;
  const userData = { userId, username, email };

  const isDeleted = await deleteUser_S(userData);

  if (isDeleted === false)
    throw new APIError("User was not deleted successfully", 400);

  userLogger.info("User deleted successfully", { userId });
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const createUser = catchAsync(async (req, res) => {
  const userId = req.userId;

  const userData = req.body;

  const user = await createUser_S(userData, userId);

  if (!user) {
    authLogger.warn("User registration failed");
    throw new APIError("User registration failed", 400);
  }

  res.status(201).json({
    message: "User created successfully",
    data: { user },
  });
});
