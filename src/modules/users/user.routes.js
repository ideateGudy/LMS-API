import express from "express";
import {
  getUser,
  getUsers,
  enrollCourse,
  getEnrolledCourses,
  unEnrollCourse,
  updateUser,
  updatePassword,
  deleteUser,
  createUser,
} from "./user.controller.js";
// import { celebrate, Joi }  from "celebrate"
import { authorize } from "../../middlewares/auth.middleware.js";
import {
  validateCourse,
  updateUserValidation,
  updatePasswordValidation,
} from "./user.validator.js";

const router = express.Router();
// Routes

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User management routes
 */

/**
 * @swagger
 * /api/users/user:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's profile
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         courses:
 *                           type: array
 *                           items:
 *                             type: object
 *                       example:
 *                         _id: "60d0fe4f5311236168a109ca"
 *                         email: "user@example.com"
 *                         name: "John Doe"
 *                         role: "student"
 *                         courses: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/user", getUser);

/**
 * @swagger
 * /api/users/enroll/{courseId}:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll the user in a course specified by the `courseId`.
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
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
router.post("/enroll/:courseId", validateCourse, enrollCourse);

/**
 * @swagger
 * /api/users/unenroll/{courseId}:
 *   delete:
 *     summary: Unenroll from a course
 *     description: Unenroll the user from a course specified by the `courseId`.
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
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
router.delete("/unenroll/:courseId", validateCourse, unEnrollCourse);

/**
 * @swagger
 * /api/users/enrolled-courses:
 *   get:
 *     summary: Get enrolled courses
 *     description: Fetch a list of courses that the user is enrolled in.
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
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
router.get("/enrolled-courses", getEnrolledCourses);

router.put("/update", updateUserValidation, updateUser);

router.put("/change-password", updatePasswordValidation, updatePassword);

//Admins-------------------------------------->>>>>

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for admin access
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
 *                           role:
 *                             type: string
 *                           courses:
 *                             type: array
 *                             items:
 *                               type: object
 *       403:
 *         description: Forbidden - Only admin can access this route
 *       404:
 *         description: No users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No users found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/create", authorize("admin"), createUser);
router.get("/", authorize("admin"), getUsers);
router.delete("/", authorize("admin"), deleteUser);

export default router;

//TODO:
// GET	/api/users -	Get all users (admin-only)                                                    ✅docs✅
// GET	/api/users/user -	Get logged-in user profile                                                ✅docs✅
// POST	/api/users/enroll/:courseId -	Enroll in a course                                            ✅docs✅
// DELETE	/api/users/unenroll/:courseId -	Unenroll from a course                                    ✅docs✅
// GET	/api/users/enrolled-courses -	Get list of courses the user is enrolled in                   ✅docs✅
// PUT	/api/users/update -	Update own user profile                                                 ✅docs
// PUT  /api/auth/change-password	- Update password                                                 ✅docs
// DELETE	/api/users?username=test&id=55367738 -	Delete a user (admin-only)                        ✅docs
// POST  /api/users/create -		Create a new user (admin-only)                                      ✅docs
