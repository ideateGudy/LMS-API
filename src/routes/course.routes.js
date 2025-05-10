import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
} from "../controllers/course.controller.js";
import { authenticateUser, authorize } from "../middlewares/auth.middleware.js";

import {
  courseQueryValid,
  createCourseValidation,
} from "../validators/course.validator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Courses management routes
 */

/**
 * @swagger
 * /api/courses/courses:
 *   get:
 *     summary: Retrieve a list of all courses
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by course category
 *       - in: query
 *         name: skillLevel
 *         schema:
 *           type: string
 *         description: Filter by skill level (e.g., beginner, intermediate, advanced)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text in course title or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of courses
 *       500:
 *         description: Server error
 */

router.get("/", courseQueryValid, getCourses);

/**
 * @swagger
 * /api/courses/courses/course/{courseId}:
 *   get:
 *     summary: Get a single course by its ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to retrieve
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */

router.get("/course/:courseId", getCourseById);

//Admin and instructors------------------------------------>>>>>>>>>>>>>>>>>>>>>>>>

/**
 * @swagger
 * /api/courses/courses:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - skillLevel
 *               - modules
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               skillLevel:
 *                 type: string
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     moduleNumber:
 *                       type: integer
 *                     duration:
 *                       type: string
 *                     material:
 *                       type: string
 *                     promoVideo:
 *                       type: string
 *                     lessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           videoUrl:
 *                             type: string
 *                           lessonNumber:
 *                             type: integer
 *                           duration:
 *                             type: string
 *                           material:
 *                             type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 * /api/courses/courses/mine:
 *   get:
 *     summary: Get all courses created by the authenticated user
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: skillLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         default: desc
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
  "/mine",
  authenticateUser,
  authorize("admin", "instructor"),
  courseQueryValid,
  getMyCourses
);

//TODO: Add instructors to an existing course granting them permission to manage students
// router.post("/course/:courseId/instructors", authenticateUser, authorize("admin"), addInstructorsToCourse);
// router.get("/course/:courseId/students", authenticateUser, authorize("admin", "instructor"), getStudentsInCourse);

export default router;

//TODO:
// GET	/api/courses	Get all courses with filters                                  ✅docs✅
// POST	/api/courses	Create a new course (admin/instructor)                        ✅docs✅
// GET	/api/courses/course/:courseId	Get course by ID                              ✅docs
// GET	/api/courses/mine	Get courses created by the logged-in instructor           ✅docs
// PUT	/api/courses/course/:courseId	Update course details (owner only)
// DELETE	/api/courses/course/:courseId	Delete course (admin/instructor only)
// GET /api/courses/course/:courseId/students – get all students in a course (for instructors)
// POST /api/courses/course/:courseId/feedback – submit feedback or rating
// GET /api/courses/course/:courseId/progress – instructor view of student progress
//Add instructors to an existing course granting them permission to manage students
