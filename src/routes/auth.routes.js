import express from "express";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verficationValidation,
} from "../validators/auth.validator.js";
import {
  verificationCode,
  register,
  loginUser,
  refreshTokenController,
  forgotPassword,
  resetPassword,
  // resetPasswordGet,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization routes
 */

/**
 * @swagger
 * /api/auth/otp-code:
 *   post:
 *     summary: Send verification code to email
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
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Verification code sent to user's email
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
//send verification code to email
router.post("/otp-code", registerValidation, verificationCode);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with activation token and code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activation_token
 *               - activation_code
 *             properties:
 *               activation_token:
 *                 type: string
 *               activation_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid activation code or token
 */

// Route for user registration
router.post("/register", verficationValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and receive access and refresh tokens
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

// Route for user login
router.post("/login", loginValidation, loginUser);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   get:
 *     summary: Refresh the access token using a valid refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */

// Route for refreshing the access token
router.get("/refresh-token", refreshTokenController);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset link to user's email
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
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */

// Route for sending a password reset link to the user's email
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token from email
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
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: New password matches old one
 *       404:
 *         description: User not found
 */

// Route for resetting the password using the token sent to the user's email
router.post("/reset-password", resetPasswordValidation, resetPassword);

export default router;

//TODO:
// POST	/api/auth/register	Register a new user                           ✅docs✅
// POST	/api/auth/login	Login and receive JWT token                       ✅docs✅
// POST	/api/auth/forgot-password	- Send reset link                       ✅docs✅
// POST	/api/auth/reset-password	- Reset with token                      ✅docs✅
// POST	/api/auth/verify-otp	- Verify OTP (optional)
// POST	/api/auth/verify-email	- Verify email with token (optional)
// POST	/api/auth/logout	- Invalidate user session
// POST	/api/auth/refresh	- Refresh JWT token-
