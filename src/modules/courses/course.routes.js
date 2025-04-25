import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
} from "./course.controller.js";
import {
  authenticateUser,
  authorize,
} from "../../middlewares/auth.middleware.js";

import {
  courseQueryValid,
  createCourseValidation,
} from "./course.validator.js";

const router = express.Router();

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
 *       - name: category
 *         in: query
 *         description: Filter courses by category
 *         required: false
 *         type: string
 *       - name: skillLevel
 *         in: query
 *         description: Filter courses by skill level
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 totalResult:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           category:
 *                             type: string
 *                           skillLevel:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: No courses found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No courses found"
 */

router.get("/", courseQueryValid, getCourses);
router.get("/:courseId", getCourseById);

//Admin and instructors------------------------------------>>>>>>>>>>>>>>>>>>>>>>>>

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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               skillLevel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         category:
 *                           type: string
 *                         skillLevel:
 *                           type: string
 *                         createdBy:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: All fields are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 */
router.post(
  "/",
  authenticateUser,
  authorize("admin", "instructor"),
  createCourseValidation,
  createCourse
);

//TODO: error:  CastError Cast to ObjectId failed for value "mine" (type string) at path "_id" for model "Course"
router.get(
  "/mine",
  authenticateUser,
  authorize("admin", "instructor"),
  getMyCourses
);

export default router;

//TODO:
// GET	/api/courses	Get all courses with filters                                  ✅docs✅
// POST	/api/courses	Create a new course (admin/instructor)                        ✅docs✅
// GET	/api/courses/:courseId	Get course by ID                                    ✅docs
// GET	/api/courses/mine	Get courses created by the logged-in instructor
// PUT	/api/courses/:courseId	Update course details (owner only)
// DELETE	/api/courses/:courseId	Delete course (admin/instructor only)
// GET /api/courses/:courseId/students – get all students in a course (for instructors)
// POST /api/courses/:courseId/feedback – submit feedback or rating
// GET /api/courses/:courseId/progress – instructor view of student progress
//Add instructors to an existing course granting them permission to manage students
