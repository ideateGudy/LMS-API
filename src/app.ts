import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { morganMiddleware } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
// import cookieParser from 'cookie-parser';

// Import Error handlers
// import { errors } from 'celebrate';
import { globalErrorHandler } from './middlewares/errorHandler';
import { APIError } from './utils/errorClass';
import { authenticateUser } from './middlewares/auth.middleware';

// Import route types
import { Router } from 'express';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import courseRoutes from './modules/courses/course.routes';
import progressRoutes from './modules/progress/progress.routes';

// Initialize express app with type
const app: Express = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares with proper typing
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use(cookieParser());

app.use(morganMiddleware);

// Route mounting with type safety
app.use('/api/auth', authRoutes as Router);
app.use('/api/users', authenticateUser, userRoutes as Router);
app.use('/api/courses', courseRoutes as Router);
app.use('/api/progress', authenticateUser, progressRoutes as Router);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Dive Africa LMS API 🎓',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new APIError(`Route ${req.originalUrl} Not Found`, 404));
});

// Global error handler (must be last middleware)
app.use(globalErrorHandler as ErrorRequestHandler);

export default app;