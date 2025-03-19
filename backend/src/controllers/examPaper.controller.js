// controllers/examPaper.controller.js
import ExamPaper from "../models/examPaper.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Question from "../models/question.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createExamPaper = asyncHandler(async (req, res) => {
  const { examName, className, subject, questionIds, createdBy } = req.body;

  // Validate required fields.
  if (
    !examName ||
    !className ||
    !subject ||
    !questionIds ||
    !Array.isArray(questionIds) ||
    questionIds.length === 0
  ) {
    throw new ApiError(
      400,
      "Missing required fields: examName, className, subject, and questionIds are required"
    );
  }

  // Create the exam paper document.
  const newExamPaper = new ExamPaper({
    examName,
    className,
    subject,
    questions: questionIds,
    createdBy,
  });

  // Saving the exam paper triggers the pre-save hook to compute totalMarks.
  const savedExamPaper = await newExamPaper.save();

  return res.status(201).json(new ApiResponse(201, savedExamPaper, "Exam paper created successfully"));
});

export const getQuestionsByClassTopicSubtopic = asyncHandler(async (req, res) => {
  const { className, subject, topic, subTopic } = req.query;

  if (!className || !subject || !topic || !subTopic) {
    throw new ApiError(400, "className, subject, topic, and subTopic are required");
  }

  const filter = {
    className: { $regex: className.trim(), $options: "i" },
    subject: { $regex: subject.trim(), $options: "i" },
    topic: { $regex: topic.trim(), $options: "i" },
    subTopic: { $regex: subTopic.trim(), $options: "i" },
  };

  const questions = await Question.find(filter);

  return res.status(200).json(new ApiResponse(200, questions, "Questions fetched successfully"));
});

export const addQuestionsToExamPaper = asyncHandler(async (req, res) => {
  const { examPaperId, questionIds } = req.body;

  // Validate input: examPaperId and a non-empty array of questionIds are required.
  if (!examPaperId || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw new ApiError(400, "examPaperId and a non-empty array of questionIds are required");
  }

  // Find the exam paper document by its ID.
  const examPaper = await ExamPaper.findById(examPaperId);
  if (!examPaper) {
    throw new ApiError(404, "Exam paper not found");
  }

  // Avoid duplicate question entries by checking existing question IDs.
  const existingQuestionIds = examPaper.questions.map((id) => id.toString());
  const uniqueNewQuestionIds = questionIds.filter((qId) => !existingQuestionIds.includes(qId));

  // Add the new questions to the exam paper's questions array.
  examPaper.questions = examPaper.questions.concat(uniqueNewQuestionIds);

  // Saving the exam paper triggers the pre-save hook to recalculate totalMarks.
  const updatedExamPaper = await examPaper.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedExamPaper, "Questions added to exam paper successfully"));
});
