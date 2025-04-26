import { Request, Response } from 'express';
import { catchAsync } from "../../utils/catchAsync";
import User from "./user.model";
import Course from "../courses/course.model";
import { APIError } from "../../utils/errorClass";
import { logger } from "../../utils/logger";
import mongoose, {Types} from "mongoose";

const userLogger = logger.child({
  logIdentifier: "User Controller",
});

interface IUserRequest extends Request {
  userId?: string;
}

export const getUser = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = req.userId;
  const user = await User.findById(userId)
    .select("-password")
    .populate("coursesCreatedByUser");
  if (!user) {
    userLogger.error("User not found", { userId });
    throw new APIError("User not found", 404);
  }

  userLogger.info("User retrieved successfully", { userId });
  res.status(200).json({ status: true, data: { user } });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { username, email, role } = req.query;

  const filters: Record<string, any> = {};
  if (username) filters.username = username;
  if (email) filters.email = email;
  if (role) filters.role = role;

  const users = await User.find(filters)
    .select("-password")
    .sort({ createdAt: -1 })
    .populate("coursesCreatedByUser");
  if (!users || users.length === 0) {
    userLogger.error("No users found");
    throw new APIError("No users found", 404);
  }
  const count = users.length;
  userLogger.info("Users retrieved successfully", { count });

  res.status(200).json({ status: true, count, data: { users } });
});



export const enrollCourse = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const { courseId: courseIdParam } = req.params;
  if (!courseIdParam) throw new APIError("No Course selected", 400);

  const courseId = new mongoose.Types.ObjectId(courseIdParam);
  const course = await Course.findById(courseId);

  if (!course) throw new APIError("No Course found", 400);

  const user = await User.findById(userId).populate("enrolledCourses");
  if (!user) throw new APIError("User not found", 404);

  if (user.enrolledCourses.some((course: any) => course._id.equals(courseId))) {
    userLogger.warn("Already enrolled in this course", {
      userId,
      courseId,
    });
    return res.status(400).json({
      status: false,
      message: "Already enrolled in this course",
    });
  }

  user.enrolledCourses.push(courseId);
  if (!course.enrolledStudents) course.enrolledStudents = [];
  course.enrolledStudents.push(userId);
  
  await user.save();
  await course.save();

  userLogger.info("User enrolled in course", {
    userId,
    courseId,
  });
  res.status(200).json({
    status: true,
    message: `Successfully enrolled in ${course.title}`,
    data: { course },
  });
});



export const unEnrollCourse = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const { courseId: courseIdParam } = req.params;
  
  if (!courseIdParam) throw new APIError("No Course selected", 400);
  const courseId = new mongoose.Types.ObjectId(courseIdParam);

  const course = await Course.findById(courseId);
  if (!course) throw new APIError("No Course found", 400);

  const user = await User.findById(userId).populate("enrolledCourses");
  if (!user) throw new APIError("User not found", 404);

  // Check enrollment
  const isEnrolled = user.enrolledCourses.some(
    (enrolledCourse) => enrolledCourse._id.equals(courseId)
  );
  
  if (!isEnrolled) {
    userLogger.warn("Not enrolled in this course", { userId, courseId });
    return res.status(400).json({
      status: false,
      message: "Not enrolled in this course",
    });
  }

  // Use pull with proper typing
  // user.enrolledCourses.pull(courseId);
  (course.enrolledStudents as Types.Array<Types.ObjectId>).pull(userId);
  
  if (course.enrolledStudents) {
    (course.enrolledStudents as mongoose.Types.Array<mongoose.Types.ObjectId>).pull(userId);
  }

  await Promise.all([user.save(), course.save()]);

  userLogger.info("User unenrolled from course", { userId, courseId });
  res.status(200).json({
    status: true,
    message: `Successfully unenrolled from ${course.title}`,
    data: { course },
  });
});



export const getEnrolledCourses = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = req.userId;
  const user = await User.findById(userId).populate("enrolledCourses");

  if (!user) throw new APIError("User not found", 404);

  if (user.enrolledCourses.length === 0) {
    return res.status(200).json({
      status: true,
      message: "No enrolled courses",
      data: { courses: [] },
    });
  }

  userLogger.info("Enrolled courses retrieved successfully", {
    userId,
    count: user.enrolledCourses.length,
  });

  res.status(200).json({
    status: true,
    count: user.enrolledCourses.length,
    data: {
      courses: user.enrolledCourses,
    },
  });
});

export const updateUser = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = req.userId;
  const { username, email } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new APIError("User not found", 404);
  if (username) user.username = username;
  if (email) user.email = email;
  await user.save();
  userLogger.info("User updated successfully", { userId });
  return res.status(200).json({
    status: true,
    message: "User updated successfully",
    data: { user },
  });
});

export const changePassword = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new APIError("User not found", 404);
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new APIError("Old password is incorrect", 400);

  const isSame = await user.comparePassword(newPassword);
  if (isSame)
    throw new APIError("New password cannot be same as old password", 400);
  user.password = newPassword;
  await user.save();
  userLogger.info("User password changed successfully", { userId });
  return res.status(200).json({
    status: true,
    message: "Password changed successfully",
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId, username } = req.query;

  const user = await User.findOneAndDelete({
    $or: [{ _id: userId }, { username }],
  });
  if (!user) throw new APIError("User not found", 404);
  userLogger.info("User deleted successfully", { userId });
  res.status(204).send("");
});

export const createUser = catchAsync(async (req: IUserRequest, res: Response) => {
  const userId = req.userId;

  const { username, email, role, password } = req.body;

  if (!username || !email || !password) {
    userLogger.warn("All fields are required");
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser?.username === username) {
    userLogger.warn("User already exists with this username");
    throw new APIError(
      `User already exists with this username ${username}`,
      409
    );
  }

  if (existingUser?.email === email) {
    userLogger.warn("User already exists with this email");
    return res.status(409).json({
      status: false,
      message: `User already exists with this email ${email} `,
    });
  }

  const newUser = await User.create({
    username,
    email,
    role,
    createdBy: userId,
    password,
  });

  const { password: _, ...userWithoutPassword } = newUser.toObject();

  res.status(201).json({
    message: "User registered successfully",
    data: { user: userWithoutPassword },
  });
});