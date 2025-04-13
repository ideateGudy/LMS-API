import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import cookieParser from "cookie-parser";

//Import Error handlers
// import { errors } from "celebrate";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { APIError } from "./utils/errorClass.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
// import userRoutes from "./modules/users/user.routes.js"
// import courseRoutes from "./modules/courses/course.routes.js"

//initialize express app
const app = express();

//Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
// app.use(cookieParser());

// Mount all routes
app.use("/api/auth", authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/courses', courseRoutes);

// Celebrate validation errors
// app.use(errors());

// Catch-all route that are not registered yet for 404s
app.use((req, res, next) => {
  next(new APIError(`Route ${req.originalUrl} Not Found`, 404));
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
