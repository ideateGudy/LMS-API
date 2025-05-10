import { logger } from "../config/winston.js";
import { catchAsync } from "../utils/catchAsync.js";

import {
  createAssignment,
  submitOrUpdateAssignment,
  gradeSubmission,
  getSubmissions,
  getAssignments,
} from "../services/assignment.service.js";

const assignmentLogger = logger.child({
  logIdentifier: "Assignment Controller",
});

export const handleCreateAssignment = catchAsync(async (req, res) => {
  const assignment = await createAssignment(req.body);
  if (!assignment) {
    assignmentLogger.error("Failed to create assignment", {
      userId: req.userId,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
  res.status(201).json({ success: true, data: { assignment } });
});

export const handleSubmitAssignment = catchAsync(async (req, res) => {
  const { content, linkUrl } = req.body;
  const { assignmentId } = req.query;
  const studentId = req.userId;

  const file = req.file;
  const fileUrl = file?.path || null;
  const fileName = file?.originalname || null;
  const fileSize = file?.size || null;
  const fileType = file?.mimetype || null;

  const submission = await submitOrUpdateAssignment({
    content,
    assignmentId,
    studentId,
    linkUrl,
    fileUrl,
    fileName,
    fileSize,
    fileType,
  });

  if (!submission) {
    assignmentLogger.error("Failed to submit assignment", {
      userId: req.userId,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
    });
  }

  res.status(200).json({ success: true, data: { submission } });
});

export const handleGradeSubmission = catchAsync(async (req, res) => {
  const { submissionId } = req.params;
  const { grade, reviewedStatus, reviewFeedbackMessage } = req.body;
  const reviewedBy = req.userId;

  const feedback = await gradeSubmission(submissionId, {
    grade,
    reviewedStatus,
    reviewFeedbackMessage,
    reviewedBy,
  });

  res.status(200).json({ success: true, data: { feedback } });
});

export const handleGetSubmissionsUser = catchAsync(async (req, res) => {
  const { assignmentId, courseId } = req.query;
  const studentId = req.userId;

  const data = {
    assignmentId,
    studentId,
    courseId,
  };

  const submissions = await getSubmissions(data);

  res
    .status(200)
    .json({ success: true, count: submissions.length, data: { submissions } });
});

export const handleGetSubmissionsAdmin = catchAsync(async (req, res) => {
  const { assignmentId, courseId } = req.params;

  const data = {
    assignmentId,
    courseId,
  };

  const submissions = await getSubmissions(data);

  res
    .status(200)
    .json({ success: true, count: submissions.length, data: { submissions } });
});

export const handleGetAssignments = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { moduleId, lessonId } = req.query;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course ID is required",
    });
  }
  if (lessonId) {
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required when lesson ID is provided",
      });
    }
  }

  const userId = req.userId;
  const assignments = await getAssignments(userId, {
    courseId,
    moduleId,
    lessonId,
  });

  res
    .status(200)
    .json({ success: true, count: assignments.length, data: { assignments } });
});
