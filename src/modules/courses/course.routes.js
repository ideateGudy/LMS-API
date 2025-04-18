import express from "express";
import {
  createCourse,
  getCourses,
  enrollCourse,
  getEnrolledCourses,
  unEnrollCourse,
} from "./course.controller.js";
import { authorize } from "../../middlewares/auth.middleware.js";

import {
  getCourseValidation,
  createCourseValidation,
  enrollCourseValidation,
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

router.get("/", getCourseValidation, getCourses);

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

  authorize("admin", "instructor"),
  createCourseValidation,
  createCourse
);

/**
 * @swagger
 * /api/courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll the user in a course specified by the `courseId`.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to enroll in
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully enrolled in course"
 *       400:
 *         description: Already enrolled in this course
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
 *                   example: "Already enrolled in this course"
 *       404:
 *         description: Course or user not found
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
 *                   example: "Course or user not found"
 */

router.post(
  "/:courseId/enroll",

  enrollCourseValidation,
  enrollCourse
);

/**
 * @swagger
 * /api/courses/enrolled:
 *   get:
 *     summary: Get enrolled courses
 *     description: Fetch a list of courses that the user is enrolled in.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Successfully retrieved enrolled courses
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
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
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
 *         description: No enrolled courses found
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
 *                   example: "No enrolled courses found"
 */

router.get(
  "/enrolled",

  getCourseValidation,
  getEnrolledCourses
);

/**
 * @swagger
 * /api/courses/{courseId}/un-enroll:
 *   delete:
 *     summary: Unenroll from a course
 *     description: Unenroll the user from a course specified by the `courseId`.
 *     security:
 *       - bearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to unenroll from
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully unenrolled from the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully unenrolled from course"
 *       400:
 *         description: Not enrolled in this course
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
 *                   example: "Not enrolled in this course"
 *       404:
 *         description: Course or user not found
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
 *                   example: "Course or user not found"
 */
//un enroll for course
router.delete(
  "/:courseId/un-enroll",

  enrollCourseValidation,
  unEnrollCourse
);

export default router;
