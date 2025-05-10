import express from "express";
import {
  updateCourseProgressHandler,
  updateLessonCompletionHandler,
} from "../controllers/progress.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Progress
 *     description: Course and lesson progress tracking routes
 */

/**
 * @swagger
 * /api/progress/course-progress:
 *   put:
 *     summary: Update Course Progress
 *     description: Updates the progress of a course for a user based on completion of associated modules and lessons.
 *     operationId: updateCourseProgress
 *     tags:
 *       - Progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to update progress for.
 *                 example: "course_12345"
 *     responses:
 *       200:
 *         description: Course progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the course progress update was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message about the result of the update
 *                   example: "Course progress updated"
 *                 courseProgress:
 *                   type: number
 *                   description: The updated progress percentage of the course
 *                   example: 75
 *       400:
 *         description: Bad request due to missing course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Course ID is required"
 *       403:
 *         description: User is not enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to enrollment issue
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "User not enrolled in this course"
 *       404:
 *         description: Course progress not found or no enrolled courses found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to missing course progress
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Course progress not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to server issues
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Internal Server Error"
 */

// Route to update course progress
router.put("/course-progress", updateCourseProgressHandler);

/**
 * @swagger
 * /api/progress/lesson-completion:
 *   put:
 *     summary: Update Lesson Completion
 *     description: Marks a lesson as completed or not completed and recalculates the progress for the associated module and course.
 *     operationId: updateLessonCompletion
 *     tags:
 *       - Progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *                 description: The ID of the lesson to update
 *                 example: "lesson_98765"
 *               completed:
 *                 type: boolean
 *                 description: The completion status of the lesson (true for completed, false for not completed)
 *                 example: true
 *     responses:
 *       200:
 *         description: Lesson completion status updated successfully and progress recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the lesson completion update was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message about the result of the update
 *                   example: "Lesson completion updated and progress recalculated"
 *                 moduleProgress:
 *                   type: number
 *                   description: The updated progress percentage of the module
 *                   example: 50
 *                 courseProgress:
 *                   type: number
 *                   description: The updated progress percentage of the course
 *                   example: 75
 *                 congrats:
 *                   type: string
 *                   description: A congratulations message if the course is fully completed
 *                   example: "Congratulations! You've completed the course!"
 *       400:
 *         description: Bad request due to missing lesson ID or completion status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Lesson ID and completion status are required"
 *       403:
 *         description: User is not enrolled in the course associated with the lesson
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to enrollment issue
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "User not enrolled in this course"
 *       404:
 *         description: Lesson or related module/course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to missing lesson or progress data
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Lesson not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates a failed request due to server issues
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: The error message
 *                   example: "Internal Server Error"
 */

// Route to update lesson completion and associated progress
router.put("/lesson-completion", updateLessonCompletionHandler);

export default router;
