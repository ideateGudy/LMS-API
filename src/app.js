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
// import { authenticateUser } from "./middlewares/auth.middleware.js";

//initialize express app
const app = express();

// Import routes
import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./modules/users/user.routes.js";
// import courseRoutes from "./modules/courses/course.routes.js";
// import progressRoutes from "./modules/progress/progress.routes.js";

//Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(morganMiddleware);

// Mount all routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", authenticateUser, userRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/progress", authenticateUser, progressRoutes);

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
