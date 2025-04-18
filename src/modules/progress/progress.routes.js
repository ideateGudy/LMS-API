import express from "express";
import {
  getAllProgress,
  getProgressByCourse,
  updateProgress,
} from "./progress.controller.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Endpoints for tracking student progress in courses
 */

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all progress records for the logged-in user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of progress records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Progress'
 *       404:
 *         description: No progress found
 *       401:
 *         description: Unauthorized
 */

router.get("/", getAllProgress);

/**
 * @swagger
 * /api/progress/{courseId}:
 *   get:
 *     summary: Get progress for a specific course
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Progress data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       $ref: '#/components/schemas/Progress'
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: No progress found for this course
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update or create progress for a course
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - percentage
 *             properties:
 *               percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Progress updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 progress:
 *                   $ref: '#/components/schemas/Progress'
 *       201:
 *         description: Progress created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 progress:
 *                   $ref: '#/components/schemas/Progress'
 *       400:
 *         description: Bad request (missing percentage or course ID, or invalid value)
 *       401:
 *         description: Unauthorized
 */
router.get("/:courseId", getProgressByCourse);
router.patch("/:courseId", updateProgress);

export default router;
