import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';
import { SwaggerDefinition, Options } from 'swagger-jsdoc';

// Convert file URL to path (ESM compatibility)
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
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
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
 *           default: null
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
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         skillLevel:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         duration:
 *           type: string
 *           default: 1 hour
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *         createdBy:
 *           type: string
 *           description: User ID of the course creator
 *         enrolledStudents:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Progress:
 *       type: object
 *       required:
 *         - student
 *         - course
 *       properties:
 *         _id:
 *           type: string
 *         student:
 *           type: string
 *           description: User ID of the student
 *         course:
 *           type: string
 *           description: Course ID
 *         percentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Type for server configuration
interface ServerConfig {
  url: string;
  description: string;
}

// Type for Swagger options
interface SwaggerOptions extends Options {
  definition: SwaggerDefinition & {
    servers?: ServerConfig[];
  };
}

// Swagger configuration
const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'dive-africa-backend-api',
      version: '1.0.0',
      description: 'Dive Africa Backend API documentation',
      contact: {
        name: 'API Support',
        email: process.env.API_SUPPORT_EMAIL || 'support@diveafrica.com',
      },
      license: {
        name: 'MIT',
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
    servers: [
      {
        url: process.env.SWAGGER_LOCAL_SERVER || 'http://localhost:3000',
        description: 'Local development server',
      },
      {
        url: process.env.SWAGGER_PRODUCTION_SERVER || 
             'https://dive-africa-lms-backend.onrender.com',
        description: 'Production server (Render)',
      },
    ],
  },
  apis: [
    path.join(__dirname, './modules/**/*.ts'),  // Changed from .js to .ts
    path.join(__dirname, './modules/**/*.yaml'),
    path.join(__dirname, './swagger.ts'),       // Changed from .js to .ts
  ],
};

// Generate Swagger specification
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;