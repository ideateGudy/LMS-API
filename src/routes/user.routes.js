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
} from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import {
  validateCourse,
  updateUserValidation,
  updatePasswordValidation,
  getUsersValidator,
} from "../validators/user.validator.js";

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
 *     summary: Retrieve the authenticated user's profile data.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's profile data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.get("/user", getUser);

/**
 * @swagger
 * /api/users/user/enroll/{courseId}:
 *   post:
 *     summary: Enroll the authenticated user in a course.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to enroll in.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled in the course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully enrolled in [Course Title]"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       400:
 *         description: Course ID missing or invalid.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.post("/user/enroll/:courseId", validateCourse, enrollCourse);

/**
 * @swagger
 * /api/users/user/unenroll/{courseId}:
 *   delete:
 *     summary: Unenroll the authenticated user from a course.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to unenroll from.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unenrolled from the course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully unenrolled from [Course Title]"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       400:
 *         description: Course ID missing.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

//un enroll for course
router.delete("/user/unenroll/:courseId", validateCourse, unEnrollCourse);

/**
 * @swagger
 * /api/users/user/enrolled-courses:
 *   get:
 *     summary: Retrieve the list of courses the authenticated user is enrolled in.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of enrolled courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.get("/user/enrolled-courses", getEnrolledCourses);

/**
 * @swagger
 * /api/users/user/update:
 *   put:
 *     summary: Update the authenticated user's profile information.
 *     description: >
 *       Updates fields of the user profile except for the following restricted fields: "id", "role", and "password".
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: User profile data to update.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               country: "USA"
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Attempt to update restricted fields (id, role, or password).
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.put("/user/update", updateUserValidation, updateUser);

/**
 * @swagger
 * /api/users/user/change-password:
 *   patch:
 *     summary: Change the authenticated user's password.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Object containing the old password and new password.
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
 *               oldPassword: "oldPass123"
 *               newPassword: "newPass456"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Validation errors, such as new password matching the old password.
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.patch("/user/change-password", updatePasswordValidation, changePassword);

//Admins-------------------------------------->>>>>

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management routes
 */

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Retrieve a paginated list of users (Admin only).
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username.
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term applied to username, email, first name, last name, etc.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: "email"
 *         description: Field to sort by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: "asc"
 *         description: Sort order; either "asc" or "desc".
 *       - in: query
 *         name: isDeactivated
 *         schema:
 *           type: string
 *         description: Filter based on deactivation status (true/false).
 *     responses:
 *       200:
 *         description: A paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                     count:
 *                       type: integer
 *                       example: 30
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.get("/", authorize("admin"), getUsersValidator, getUsers);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user (Admin only).
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: User data required to create a new user.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               username: "newuser"
 *               email: "newuser@example.com"
 *               password: "pass123"
 *               role: "user"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, user creation failed.
 */

router.post("/create", authorize("admin"), createUser);

/**
 * @swagger
 * /api/users/user:
 *   delete:
 *     summary: Delete a user (Admin only) based on an identifier.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: The unique identifier of the user.
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username of the user.
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: The email of the user.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad request or deletion failed.
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
