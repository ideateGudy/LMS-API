import express from "express";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "./auth.validator.js";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  // resetPasswordGet,
} from "./auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
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
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User data excluding password
 *                     token:
 *                       type: string
 *                       description: JWT token
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       409:
 *         description: Conflict (Username or email already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

router.post("/register", registerValidation, registerUser);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User logged in successfully, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User data excluding password
 *                     token:
 *                       type: string
 *                       description: JWT token
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

router.post("/login", loginValidation, loginUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent to the user's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the request
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Password reset link sent to user@example.com"
 *       400:
 *         description: Bad Request (Email not provided or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Email is required for password reset"
 *       404:
 *         description: User not found with this email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User not found with this email"
 * */

router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password to set for the user
 *                 example: "newSecurePassword123!"
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token from the URL query string
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the reset operation
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Password has been reset successfully"
 *       400:
 *         description: Bad Request (Invalid or expired token, or newPassword not provided or New password cannot be the same as old password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid or expired token or New password cannot be the same as old password"
 *       404:
 *         description: User not found with the decoded token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status of the request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User not found with the token"
 */

router.post("/reset-password", resetPasswordValidation, resetPassword);

// router.get("/reset-password", resetPasswordGet);

export default router;

//TODO:
// POST	/api/auth/register	Register a new user                           ✅docs✅
// POST	/api/auth/login	Login and receive JWT token                       ✅docs✅
// POST	/api/auth/forgot-password	- Send reset link                       ✅docs✅
// POST	/api/auth/reset-password	- Reset with token                      ✅docs✅
// POST	/api/auth/verify-otp	- Verify OTP (optional)
// POST	/api/auth/verify-email	- Verify email with token (optional)
// POST	/api/auth/logout	- Invalidate user session
// POST	/api/auth/refresh	- Refresh JWT token
