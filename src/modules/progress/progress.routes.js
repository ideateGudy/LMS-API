import express from "express";
import {
  getAllProgress,
  getProgressByCourse,
  updateProgress,
} from "./progress.controller.js";
const router = express.Router();

router.get("/", getAllProgress);
router.get("/:courseId", getProgressByCourse);
router.patch("/:courseId", updateProgress);

export default router;
