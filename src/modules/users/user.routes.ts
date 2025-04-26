import express, { Router } from "express";
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
} from "./user.controller";
import { authorize } from "../../middlewares/auth.middleware";
import {
  validateCourse,
  updateUserValidation,
  updatePasswordValidation,
} from "./user.validator";

const router: Router = express.Router();

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
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/EnrollmentSuccess'
 *       400:
 *         $ref: '#/components/responses/AlreadyEnrolled'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UnenrollmentSuccess'
 *       400:
 *         $ref: '#/components/responses/NotEnrolled'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
 *         $ref: '#/components/responses/EnrolledCourses'
 *       404:
 *         $ref: '#/components/responses/NoEnrolledCourses'
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
 *       $ref: '#/components/requestBodies/UpdateUser'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserUpdateSuccess'
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
 *       $ref: '#/components/requestBodies/ChangePassword'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PasswordChangeSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch("/user/change-password", updatePasswordValidation, changePassword);

// Admin-only routes
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
 *         $ref: '#/components/responses/AllUsers'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NoUsersFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *       $ref: '#/components/requestBodies/CreateUser'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/UserCreated'
 *       400:
 *         $ref: '#/components/responses/MissingFields'
 *       409:
 *         $ref: '#/components/responses/UserExists'
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
 *       - $ref: '#/components/parameters/UserIdQuery'
 *       - $ref: '#/components/parameters/UsernameQuery'
 *     responses:
 *       204:
 *         $ref: '#/components/responses/UserDeleted'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/user", authorize("admin"), deleteUser);

export default router;