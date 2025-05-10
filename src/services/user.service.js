import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { isEnrolled } from "./course.service.js";

const userLogger = logger.child({
  logIdentifier: "Auth Service",
});

export const getAllUserData_S = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { coursesCreatedByUser: true },
  });

  if (!user) {
    userLogger.error("User not found", { userId });
    throw new APIError("User not found", 404);
  }

  const { password, ...safeUser } = user;

  return safeUser;
};

export const getAllUsers_S = async (options) => {
  const { page, limit, sortBy, sortOrder, search, filters } = options;

  const skip = (page - 1) * limit;
  const orderDirection = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";

  // Basic filters + optional search logic
  const whereClause = {
    ...filters,
    OR: search
      ? [
          { username: { contains: search } },
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { country: { contains: search } },
          { city: { contains: search } },
        ]
      : undefined,
  };

  // Get total count

  // Get paginated users
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: orderDirection,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isDeactivated: true,
        firstName: true,
        lastName: true,
        gender: true,
        age: true,
        country: true,
        city: true,
        profilePicture: true,
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    total,
    page,
    totalPages,
  };
};

export const enrollCourse_S = async (userId, courseId) => {
  const authorize = await isEnrolled(userId, courseId);
  if (authorize.isOwner) {
    userLogger.warn("Cannot enroll in your own course", { userId, courseId });
    throw new APIError("Cannot enroll in your own course", 400);
  }

  if (authorize.isStudent) {
    userLogger.warn("Already enrolled in this course", { userId, courseId });
    throw new APIError("Already enrolled in this course", 400);
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      enrolledStudents: {
        connect: { id: userId },
      },
    },
    include: {
      enrolledStudents: true,
    },
  });

  if (!course) throw new APIError("No course found", 404);

  await prisma.user.update({
    where: { id: userId },
    data: {
      enrolledCourses: {
        connect: { id: courseId },
      },
    },
    include: {
      enrolledCourses: true,
    },
  });

  userLogger.info("User enrolled in course", {
    userId,
    courseId,
  });

  return course;
};

export const unenrollCourse_S = async (userId, courseId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrolledCourses: {
        select: { id: true },
      },
    },
  });
  if (!user) throw new APIError("User not found", 404);

  const isEnrolled = user.enrolledCourses.some((course) => {
    return course.id === courseId;
  });
  if (!isEnrolled) {
    userLogger.warn("Not enrolled in this course", { userId, courseId });
    throw new APIError("Not enrolled in this course", 404);
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      enrolledStudents: {
        disconnect: { id: userId },
      },
    },
  });

  if (!course) throw new APIError("No course found", 404);

  await prisma.user.update({
    where: { id: userId },
    data: {
      enrolledCourses: {
        disconnect: { id: courseId },
      },
    },
  });

  userLogger.info("User unenrolled from course", {
    userId,
    courseId,
  });

  return course;
};

export const getEnrolledCourses_S = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      enrolledCourses: {
        select: {
          id: true,
          title: true,
          completed: true,
          instructors: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              profilePicture: true,
            },
          },
          createdBy: true,
        },
      },
    },
  });

  if (!user) throw new APIError("User not found", 404);

  userLogger.info("Enrolled courses retrieved successfully", {
    userId,
    count: user.enrolledCourses.length,
  });

  return user.enrolledCourses;
};

export const updateUserInfo_S = async (userId, userData) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: userData,
  });

  const { password, ...safeUser } = user;

  return safeUser;
};

export const changePassword_S = async (reqBody, userId) => {
  const { oldPassword, newPassword } = reqBody;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      password: true,
    },
  });
  if (!user) throw new APIError("User not found", 404);
  const oldPasswordMatch = await comparePassword(oldPassword, user.password);
  if (!oldPasswordMatch) throw new APIError("Old password is incorrect", 400);

  if (oldPassword === newPassword)
    throw new APIError("New password cannot be same as old password", 400);

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });
  userLogger.info("User password changed successfully", { userId });

  const { password, ...safeUser } = user;

  return safeUser;
};

export const deleteUser_S = async (userData) => {
  const { userId, username, email } = userData;

  // Filter out undefined or empty values
  const filters = [];
  if (username) filters.push({ username });
  if (email) filters.push({ email });
  if (userId) filters.push({ id: userId });

  if (filters.length === 0) {
    throw new APIError("No valid identifier provided", 400);
  }

  const user = await prisma.user.findFirst({
    where: { OR: filters },
  });

  if (!user) throw new APIError("User not found", 404);

  await prisma.user.update({
    where: { id: user.id },
    data: { isDeactivated: true },
  });

  return true;
};
