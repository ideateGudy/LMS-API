import express from "express";
import {
  createCourse,
  getCourses,
  enrollCourse,
  getEnrolledCourses,
  unEnrollCourse,
} from "./course.controller.js";
import { authorize } from "../../middlewares/auth.middleware.js";

import {
  getCourseValidation,
  createCourseValidation,
  enrollCourseValidation,
} from "./course.validator.js";

const router = express.Router();

router.get("/", getCourseValidation, getCourses);
router.post(
  "/",

  authorize("admin", "instructor"),
  createCourseValidation,
  createCourse
);
router.post(
  "/:courseId/enroll",

  enrollCourseValidation,
  enrollCourse
);

router.get(
  "/enrolled",

  getCourseValidation,
  getEnrolledCourses
);

//un enroll for course
router.delete(
  "/:courseId/un-enroll",

  enrollCourseValidation,
  unEnrollCourse
);

export default router;
