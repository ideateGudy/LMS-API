import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";
import { isEnrolled } from "./course.service.js";

const assignmentLogger = logger.child({
  logIdentifier: "Assignment Service",
});

const canFetchAssignment = async (userId, courseId) => {
  const { isStudent, user } = await isEnrolled(userId, courseId);

  const role = user.role;

  if (role === "instructor" || role === "admin") {
    return await prisma.assignment.findMany({
      where: { courseId },
    });
  }

  if (!isStudent) {
    assignmentLogger.error("User is not enrolled in this course", {
      courseId,
      userId,
    });
    throw new APIError("User is not enrolled in this course", 403);
  }

  return true;
};

export const createAssignment = async (data) => {
  const { courseId, moduleId, lessonId, ...assignmentData } = data;
  // !title || !task || !startDate || !dueDate
  if (
    !assignmentData.title ||
    !assignmentData.task ||
    !assignmentData.startDate ||
    !assignmentData.dueDate
  ) {
    assignmentLogger.error("Missing required fields", {
      assignmentData,
    });
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  return await prisma.assignment.create({
    data: {
      ...assignmentData,
      ...(courseId && {
        course: {
          connect: { id: courseId },
        },
      }),
      ...(moduleId && {
        module: {
          connect: { id: moduleId },
        },
      }),
      ...(lessonId && {
        lesson: {
          connect: { id: lessonId },
        },
      }),
    },
  });
};

export const submitOrUpdateAssignment = async (submissionData) => {
  const {
    content,
    assignmentId,
    studentId,
    linkUrl,
    fileUrl,
    fileName,
    fileSize,
    fileType,
  } = submissionData;

  if (!assignmentId || !studentId) {
    assignmentLogger.error("Missing required fields", {
      assignmentId,
      studentId,
    });
    throw new APIError("Missing required fields", 400);
  }

  const uniqueId = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { courseId: true },
  });
  const student = await isEnrolled(studentId, uniqueId.courseId);

  if (!student.isStudent) {
    assignmentLogger.error("User is not enrolled in this course", {
      assignmentId,
      studentId,
    });
    throw new APIError("User is not enrolled in this course", 400);
  }

  return await prisma.assignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
    update: {
      content,
      linkUrl,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    },
    create: {
      content,
      assignmentId,
      studentId,
      linkUrl,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    },
  });
};

export const gradeSubmission = async (submissionId, reqBody) => {
  const { grade, reviewedStatus, reviewFeedbackMessage, reviewedBy } = reqBody;
  if (!submissionId) {
    assignmentLogger.error("Submission ID is required", {
      submissionId,
    });
    throw new APIError("Submission ID is required", 400);
  }

  if (!reviewedStatus) {
    assignmentLogger.error("Reviewed status is required", {
      submissionId,
    });
    throw new APIError("Reviewed status is required", 400);
  }
  if (!reviewFeedbackMessage) {
    assignmentLogger.error("Review feedback message is required", {
      submissionId,
    });
    throw new APIError("Review feedback message is required", 400);
  }

  return await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      ...(grade && {
        grade,
        status: "Graded",
        graded: true,
        gradedAt: new Date().toISOString(),
      }),
      reviewed: true,
      reviewedStatus,
      reviewedAt: new Date().toISOString(),
      reviewFeedbackMessage,
      reviewedBy,
      ...(reviewedStatus === "Rejected" && { rejectedAt: new Date() }),
    },
  });
};

export const getSubmissions = async (data) => {
  const { assignmentId, studentId, courseId } = data;
  //if asignmentid and studentId are provided, return the unique submission
  if (assignmentId && studentId) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (!submission) {
      assignmentLogger.error("No Submission for this assignment", {
        assignmentId,
        studentId,
      });
      throw new APIError("No Submission for this assignment", 404);
    }
    return submission;
  }

  if (assignmentId) {
    return await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
    });
  }

  if (studentId) {
    return await prisma.assignmentSubmission.findMany({ where: { studentId } });
  }

  if (courseId) {
    return await prisma.assignmentSubmission.findMany({
      where: { assignment: { courseId } },
      include: { assignment: true },
    });
  }

  return [];
};

export const getAssignments = async (userId, data) => {
  const { courseId, moduleId, lessonId } = data;

  if (courseId && moduleId) {
    const assignment = await prisma.assignment.findUnique({
      where: {
        courseId_moduleId: {
          courseId,
          moduleId,
        },
      },
    });

    if (!assignment) {
      assignmentLogger.error("No Assignment Found", {
        courseId,
        moduleId,
      });
      throw new APIError("No Assignment Found", 404);
    }
    return assignment;
  }

  if (courseId) {
    await canFetchAssignment(userId, courseId);

    const assignment = await prisma.assignment.findMany({
      where: { courseId },
    });

    if (!assignment) {
      assignmentLogger.error("No assignments for this course", {
        courseId,
      });
      throw new APIError("No assignments for this course", 404);
    }

    return assignment;
  }

  if (courseId && moduleId) {
    await canFetchAssignment(userId, courseId);
    const assignment = await prisma.assignment.findUnique({
      where: {
        courseId_moduleId: {
          courseId,
          moduleId,
        },
      },
    });

    if (!assignment) {
      assignmentLogger.error("No assignments for this module", {
        moduleId,
      });
      throw new APIError("No assignments for this module", 404);
    }

    return assignment;
  }

  if (courseId && moduleId && lessonId) {
    await canFetchAssignment(userId, courseId);
    const assignment = await prisma.assignment.findUnique({
      where: {
        courseId_moduleId_lessonId: {
          courseId,
          moduleId,
          lessonId,
        },
      },
    });

    if (!assignment) {
      assignmentLogger.error("No assignments for this lesson", {
        lessonId,
      });
      throw new APIError("No assignments for this lesson", 404);
    }

    return assignment;
  }

  return [];
};
