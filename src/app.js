import express from "express";
import cors from "cors";
import helmet from "helmet";

import { morganMiddleware } from "./config/winston.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import cookieParser from "cookie-parser";

//Import Error handlers
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { APIError } from "./utils/errorClass.js";

//Authentication Middleware
import { authenticateUser } from "./middlewares/auth.middleware.js";

//initialize express app
const app = express();

// Import routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import progressRouter from "./routes/progress.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";

//Middlewares
const corsOptions = {
  origin: [
    process.env.APP_ORIGIN_DEV, // For development
    process.env.APP_ORIGIN_PROD, // For production
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(morganMiddleware);

// Mount all routes
app.use("/api/auth", authRouter);
app.use("/api/users", authenticateUser, userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/progress", authenticateUser, progressRouter);
app.use("/api/assignments", authenticateUser, assignmentRouter);

app.get("/", (_req, res) => {
  res.send("Welcome to the Dive Africa LMS API 🎓");
});

// Catch-all route that are not registered yet
app.use((req, _res, next) => {
  next(new APIError(`Route ${req.originalUrl} Not Found`, 404));
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
