import express from "express";
import { uploadSingle } from "../config/multer.js";

import {
  handleCreateAssignment,
  handleSubmitAssignment,
  handleGradeSubmission,
  handleGetSubmissionsAdmin,
  handleGetSubmissionsUser,
  handleGetAssignments,
} from "../controllers/assignment.controller.js";

import { authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Assignment
 *     description: Assignment management routes
 */

/**
 * @swagger
 * /api/assignments/submit:
 *   post:
 *     summary: Submit or update an assignment submission
 *     description: Submits or updates a student's assignment submission for a specific assignment.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: assignmentId
 *         in: query
 *         description: The ID of the assignment to submit for
 *         required: true
 *         schema:
 *           type: string
 *       - name: Content-Type
 *         in: header
 *         description: 'Content-Type header should be multipart/form-data for file uploads.'
 *         required: true
 *         schema:
 *           type: string
 *           example: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the student's assignment submission.
 *               linkUrl:
 *                 type: string
 *                 description: A URL link to the assignment content if applicable.
 *                 example: "https://example.com/assignment"
 *               fileUrl:
 *                 type: string
 *                 description: The URL of the uploaded file.
 *                 example: "https://example.com/uploads/assignment.pdf"
 *               fileName:
 *                 type: string
 *                 description: The name of the uploaded file.
 *                 example: "assignment.pdf"
 *               fileSize:
 *                 type: integer
 *                 description: The size of the uploaded file in bytes.
 *                 example: 2048000
 *               fileType:
 *                 type: string
 *                 description: The MIME type of the uploaded file.
 *                 example: "application/pdf"
 *     responses:
 *       200:
 *         description: Successfully submitted or updated the assignment.
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
 *                     submission:
 *                       type: object
 *                       description: The submission details.
 *       400:
 *         description: Missing required fields or invalid request.
 *       500:
 *         description: Failed to submit the assignment.
 */
// Route to submit or update an assignment submission
router.post("/submit", uploadSingle, handleSubmitAssignment);

/**
 * @swagger
 * /api/assignments/submissions:
 *   get:
 *     summary: Get all submissions by a student
 *     description: Retrieves all assignments submitted by the authenticated student.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: assignmentId
 *         in: query
 *         description: The ID of the assignment to fetch submissions for.
 *         required: false
 *         schema:
 *           type: string
 *       - name: courseId
 *         in: query
 *         description: The ID of the course to filter submissions by.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions.
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
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Submission details.
 *       404:
 *         description: No submissions found.
 */
// Route to get all submissions by a student
router.get("/submissions", handleGetSubmissionsUser);

/**
 * @swagger
 * /api/assignments/course/{courseId}:
 *   get:
 *     summary: Get all assignments for a specific course
 *     description: Retrieves a list of assignments for a particular course based on the courseId. Optionally, you can filter by moduleId or lessonId through query parameters.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: courseId
 *         in: path
 *         description: The ID of the course to fetch assignments for.
 *         required: true
 *         schema:
 *           type: string
 *       - name: moduleId
 *         in: query
 *         description: The ID of the module to filter assignments by (optional).
 *         required: false
 *         schema:
 *           type: string
 *       - name: lessonId
 *         in: query
 *         description: The ID of the lesson to filter assignments by (optional).
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assignments for the course.
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
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Assignment details.
 *       404:
 *         description: No assignments found for this course.
 *       400:
 *         description: Invalid courseId or query parameters.
 */

//get assignments for a course
router.get("/course/:courseId", handleGetAssignments);

// Instructor routes, temporarily open to admins----

/**
 * @swagger
 * /api/assignments/grade/{submissionId}:
 *   put:
 *     summary: Grade a specific submission
 *     description: Allows an instructor or admin to grade a specific assignment submission based on the submissionId.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: submissionId
 *         in: path
 *         description: The ID of the submission to grade.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: string
 *                 description: The grade for the submission.
 *                 example: "A"
 *               feedback:
 *                 type: string
 *                 description: The feedback for the submission.
 *                 example: "Great work on this submission!"
 *     responses:
 *       200:
 *         description: Submission graded successfully.
 *       400:
 *         description: Invalid submissionId or grade information.
 *       404:
 *         description: Submission not found.
 */

// Route to grade a submission (by an instructor)
router.put(
  "/grade/:submissionId",
  authorize("instructor", "admin"),
  handleGradeSubmission
);

/**
 * @swagger
 * /api/assignments/assignment/{assignmentId}:
 *   get:
 *     summary: Get all submissions for a specific assignment
 *     description: Retrieves a list of all submissions for a particular assignment based on the assignmentId.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: assignmentId
 *         in: path
 *         description: The ID of the assignment to fetch submissions for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions for the assignment.
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
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Submission details.
 *       404:
 *         description: No submissions found for this assignment.
 */

// Route to get all submissions for a specific assignment
router.get(
  "/assignment/:assignmentId/",
  authorize("instructor", "admin"),
  handleGetSubmissionsAdmin
);

/**
 * @swagger
 * /api/assignments/create:
 *   post:
 *     summary: Create a new assignment
 *     description: Allows an instructor or admin to create a new assignment for a course.
 *     tags:
 *       - Assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course the assignment belongs to.
 *               title:
 *                 type: string
 *                 description: The title of the assignment.
 *               description:
 *                 type: string
 *                 description: A brief description of the assignment.
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: The due date for the assignment.
 *     responses:
 *       201:
 *         description: Assignment created successfully.
 *       400:
 *         description: Invalid input data.
 */

// Route to create an assignment (instructor)
router.post(
  "/create",
  authorize("instructor", "admin"),
  handleCreateAssignment
);

/**
 * @swagger
 * /api/assignments/course/{courseId}:
 *   get:
 *     summary: Get all submissions for a specific course
 *     description: Retrieves a list of all submissions for a specific course based on the courseId.
 *     tags:
 *       - Assignment
 *     parameters:
 *       - name: courseId
 *         in: path
 *         description: The ID of the course to fetch submissions for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions for the course.
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
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Submission details.
 *       404:
 *         description: No submissions found for this course.
 */

// Route to get all submissions for a specific course
router.get(
  "/course/:courseId",
  authorize("instructor", "admin"),
  handleGetSubmissionsAdmin
);

export default router;
