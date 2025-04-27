import express, { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
} from "./course.controller";
import {
  authenticateUser,
  authorize,
} from "../../middlewares/auth.middleware";
import {
  courseQueryValid,
  createCourseValidation,
} from "./course.validator";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Courses management routes
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all courses with optional filters by category and skill level.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/categoryQuery'
 *       - $ref: '#/components/parameters/skillLevelQuery'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CoursesList'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/", courseQueryValid, getCourses);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     summary: Get course by ID
 *     description: Retrieve a single course by its ID.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CourseDetails'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:courseId", getCourseById);

// Admin and instructor routes
/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     description: Creates a new course with the provided details. Requires 'admin' or 'instructor' role.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     requestBody:
 *       $ref: '#/components/requestBodies/CourseCreation'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CourseCreated'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/",
  authenticateUser,
  authorize("admin", "instructor"),
  createCourseValidation,
  createCourse
);

/**
 * @swagger
 * /api/courses/mine:
 *   get:
 *     summary: Get courses created by current user
 *     description: Retrieve courses created by the currently authenticated instructor/admin.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserCourses'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/mine",
  authenticateUser,
  authorize("admin", "instructor"),
  getMyCourses
);

export default router;