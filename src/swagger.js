import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Unique username for the user
 *         email:
 *           type: string
 *           description: Unique email for the user
 *         password:
 *           type: string
 *           description: Hashed password
 *         role:
 *           type: string
 *           enum: [student, instructor, admin]
 *           default: student
 *         enrolledCourses:
 *           type: array
 *           items:
 *             type: string
 *             description: Course ID
 *         createdBy:
 *           type: string
 *           description: User ID of the creator
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - skillLevel
 *         - topic
 *         - language
 *         - level
 *         - duration
 *         - meterial
 *         - promoVideo
 *         - targetAudience
 *         - curriculum
 *         - welcomeMessage
 *         - congratulationsMessage
 *         - modules
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the course
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         category:
 *           type: string
 *           description: Course category
 *         skillLevel:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *           description: Difficulty level
 *         topic:
 *           type: string
 *           description: Course topic
 *         duration:
 *           type: integer
 *           description: Estimated duration
 *         material:
 *           type: string
 *           description: Course material
 *         promoVideo:
 *           type: string
 *           description: Promotional video URL
 *         targetAudience:
 *           type: string
 *           description: Target audience
 *         requirements:
 *           type: string
 *           items:
 *             type: string
 *           description: List of prerequisite topics
 *         curriculum:
 *           type: string
 *           description: Course curriculum
 *         welcomeMessage:
 *           type: string
 *           description: Welcome message for students
 *         congratulationsMessage:
 *           type: string
 *           description: Congratulations message for course completion
 *         createdBy:
 *           type: string
 *           description: User ID of the course creator
 *         enrolledStudents:
 *           type: array
 *           items:
 *             type: string
 *             description: User IDs of enrolled students
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Module:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - moduleNumber
 *         - duration
 *         - material
 *         - promoVideo
 *         - courseId
 *         - lessons
 *       properties:
 *        id:
 *          type: string
 *          description: Unique identifier for the module
 *        title:
 *          type: string
 *        description: Module title
 *        moduleNumber:
 *          type: integer
 *          description: Module number
 *        duration:
 *          type: string
 *          description: Estimated duration
 *        material:
 *          type: string
 *          description: Module material
 *        promoVideo:
 *          type: string
 *          description: Promotional video URL
 *
 *     Lessons:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - videoUrl
 *         - lessonNumber
 *         - duration
 *         - material
 *         - moduleId
 *       properties:
 *        id:
 *          type: string
 *          description: Unique identifier for the lesson
 *        title:
 *          type: string
 *          description: Lesson title
 *        lessonNumber:
 *          type: integer
 *          description: Lesson number
 *        duration:
 *          type: string
 *          description: Estimated duration
 *        material:
 *          type: string
 *          description: Lesson material
 *        videoUrl:
 *          type: string
 *          description: Video URL
 *        moduleId:
 *          type: string
 *          description: Module ID
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *
 *
 *     CourseProgress:
 *       type: object
 *       required:
 *         - student
 *         - course
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the progress record
 *         student:
 *           type: string
 *           description: User ID of the student
 *         course:
 *           type: string
 *           description: Course ID
 *         progress:
 *           type: integer
 *           description: Progress percentage (0-100)
 *
 *     ModuleProgress:
 *       type: object
 *       required:
 *         - student
 *         - module
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the progress record
 *         student:
 *           type: string
 *           description: User ID of the student
 *         module:
 *           type: string
 *           description: Module ID
 *         progress:
 *           type: integer
 *           description: Progress percentage (0-100)
 *
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: User not found
 *
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Something went wrong
 */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "dive-africa-backend-api",
      version: "1.0.0",
      description: "Dive Africa Backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000", // For local development
        description: "Local server",
      },
      {
        url: "https://dive-africa-lms-backend.onrender.com", // For deployed app
        description: "Production server (Render)",
      },
    ],
  },
  apis: [
    path.join(__dirname, "./**/*.js"),
    path.join(__dirname, "./swagger.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
