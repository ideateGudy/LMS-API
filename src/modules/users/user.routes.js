import express from "express";
import {
  getUser,
  getUsers,
  enrollCourse,
  getEnrolledCourses,
  unEnrollCourse,
  updateUser,
  changePassword,
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
 * /api/users/user/enroll/{courseId}:
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
router.post("/user/enroll/:courseId", validateCourse, enrollCourse);

/**
 * @swagger
 * /api/users/user/unenroll/{courseId}:
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
router.delete("/user/unenroll/:courseId", validateCourse, unEnrollCourse);

/**
 * @swagger
 * /api/users/user/enrolled-courses:
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
router.get("/user/enrolled-courses", getEnrolledCourses);
/**
 * @swagger
 * /api/users/user/update:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *             example:
 *               username: new_username
 *               email: new_email@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/user/update", updateUserValidation, updateUser);

/**
 * @swagger
 * /api/users/user/change-password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             example:
 *               oldPassword: old_password123
 *               newPassword: new_password123
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       400:
 *         description: Validation error or old password incorrect
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch("/user/change-password", updatePasswordValidation, changePassword);

//Admins-------------------------------------->>>>>

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
router.get("/", authorize("admin"), getUsers);
/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Admin-only - Create a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - username
 *               - email
 *               - password
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *             example:
 *               username: johndoe
 *               email: john@example.com
 *               password: secret123
 *               role: student
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/create", authorize("admin"), createUser);
/**
 * @swagger
 * /api/users/user:
 *   delete:
 *     summary: Admin-only - Delete a user by ID or username
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to delete
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Username of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully (no content)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/user", authorize("admin"), deleteUser);

export default router;

//TODO:
// GET	/api/users -	Get all users (admin-only)                                                    ✅docs✅
// GET	/api/users/user -	Get logged-in user profile                                                ✅docs✅
// POST	/api/users/enroll/:courseId -	Enroll in a course                                            ✅docs✅
// DELETE	/api/users/unenroll/:courseId -	Unenroll from a course                                    ✅docs✅
// GET	/api/users/enrolled-courses -	Get list of courses the user is enrolled in                   ✅docs✅
// PUT	/api/users/update -	Update own user profile                                                 ✅docs✅
// PUT  /api/auth/change-password	- Update password                                                 ✅docs✅
// DELETE	/api/users?username=test&id=55367738 -	Delete a user (admin-only)                        ✅docs✅
// POST  /api/users/create -		Create a new user (admin-only)                                      ✅docs✅
