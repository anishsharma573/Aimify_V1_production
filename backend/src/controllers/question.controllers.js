import Question from "../models/question.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import xlsx from "xlsx";


export const addQuestionFromJson = asyncHandler(async (req, res) => {
  let questionsData = [];

  // Parse questions from req.body. Could be an array, JSON string, or a single object.
  if (req.body.questions) {
    if (typeof req.body.questions === "string") {
      try {
        questionsData = JSON.parse(req.body.questions);
      } catch (error) {
        throw new ApiError(400, "Invalid JSON in 'questions' field");
      }
    } else if (Array.isArray(req.body.questions)) {
      questionsData = req.body.questions;
    } else {
      // It's a single object.
      questionsData = [req.body.questions];
    }
  } else {
    // Fallback to req.body itself if 'questions' key isn't provided.
    questionsData = [req.body];
  }

  // If there's no valid data
  if (!questionsData.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No question data provided."));
  }

  // Validate and transform each question
  const finalQuestions = questionsData.map((q) => {
    // Check required fields.
    if (
      !q.questionText ||
      !q.className ||
      !q.questionType ||
      !q.subject ||
      !q.topic ||
      !q.subTopic
    ) {
      throw new ApiError(
        400,
        `Missing required fields for question: ${
          q.questionText || "(no questionText provided)"
        }`
      );
    }

    const newQ = {
      questionText: q.questionText,
      className: q.className,
      questionType: q.questionType,
      subject: q.subject,
      topic: q.topic,
      subTopic: q.subTopic,
      difficulty: q.difficulty || "Easy",
      tags: q.tags || [],
      explanation: q.explanation || "",
      bloomsTaxonomy: q.bloomsTaxonomy || "",
      marks: q.marks || 0,
      createdBy: q.createdBy,

      // For MCQ / TRUE_FALSE
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",

      // For MATCHING
      matchingPairs: q.matchingPairs || [],

      // For CODING
      codingQuestion: q.codingQuestion || null,
    };

    // Specific validations based on questionType.
    if (newQ.questionType === "MATCHING") {
      if (!Array.isArray(newQ.matchingPairs) || newQ.matchingPairs.length === 0) {
        throw new ApiError(
          400,
          `matchingPairs required for MATCHING question: ${q.questionText}`
        );
      }
    }

    if (newQ.questionType === "CODING") {
      if (
        !newQ.codingQuestion ||
        !newQ.codingQuestion.problemStatement ||
        !newQ.codingQuestion.functionSignature
      ) {
        throw new ApiError(
          400,
          `codingQuestion fields are required for CODING question: ${q.questionText}`
        );
      }
    }

    if (
      ["MCQ", "TRUE_FALSE"].includes(newQ.questionType) &&
      (!newQ.options || newQ.options.length === 0)
    ) {
      throw new ApiError(
        400,
        `Options are required for MCQ / TRUE_FALSE question: ${q.questionText}`
      );
    }

    return newQ;
  });

  // Insert into DB
  const savedQuestions = await Question.insertMany(finalQuestions);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { count: savedQuestions.length, questions: savedQuestions },
        "Questions added successfully"
      )
    );
});

export const addQuestionFromExcel = asyncHandler(async (req, res) => {
  // Check if an Excel file was uploaded.
  if (!req.file) {
    throw new ApiError(400, "No Excel file provided.");
  }

  // Read and parse the Excel file.
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  let sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (!Array.isArray(sheetData) || sheetData.length === 0) {
    throw new ApiError(400, "No question records found in the uploaded file");
  }

  // Parse matchingPairs if it's a JSON string.
  sheetData = sheetData.map((row) => {
    if (row.matchingPairs && typeof row.matchingPairs === "string") {
      try {
        row.matchingPairs = JSON.parse(row.matchingPairs);
      } catch (err) {
        throw new ApiError(
          400,
          `Invalid JSON for matchingPairs in question: ${row.questionText || "(no questionText provided)"}`
        );
      }
    }
    return row;
  });

  // Validate and transform each question from Excel
  const finalQuestions = sheetData.map((q) => {
    // Check required fields.
    if (
      !q.questionText ||
      !q.className ||
      !q.questionType ||
      !q.subject ||
      !q.topic ||
      !q.subTopic
    ) {
      throw new ApiError(
        400,
        `Missing required fields for question: ${q.questionText || "(no questionText provided)"}`
      );
    }

    const newQ = {
      questionText: q.questionText,
      className: q.className,
      questionType: q.questionType,
      subject: q.subject,
      topic: q.topic,
      subTopic: q.subTopic,
      difficulty: q.difficulty || "Easy",
      tags: q.tags || [],
      explanation: q.explanation || "",
      bloomsTaxonomy: q.bloomsTaxonomy || "",
      createdBy: q.createdBy,
      // For MCQ / TRUE_FALSE
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",
      // For MATCHING
      matchingPairs: q.matchingPairs || [],
      // For CODING
      codingQuestion: q.codingQuestion || null,
    };

    // Validate MATCHING question type.
    if (newQ.questionType === "MATCHING") {
      if (!Array.isArray(newQ.matchingPairs) || newQ.matchingPairs.length === 0) {
        throw new ApiError(
          400,
          `matchingPairs required for MATCHING question: ${q.questionText}`
        );
      }
    }

    // Validate CODING question type.
    if (newQ.questionType === "CODING") {
      if (
        !newQ.codingQuestion ||
        !newQ.codingQuestion.problemStatement ||
        !newQ.codingQuestion.functionSignature
      ) {
        throw new ApiError(
          400,
          `codingQuestion fields are required for CODING question: ${q.questionText}`
        );
      }
    }

    // Validate MCQ / TRUE_FALSE question type.
    if (
      ["MCQ", "TRUE_FALSE"].includes(newQ.questionType) &&
      (!newQ.options || newQ.options.length === 0)
    ) {
      throw new ApiError(
        400,
        `Options are required for MCQ / TRUE_FALSE question: ${q.questionText}`
      );
    }

    return newQ;
  });

  // Insert the validated questions into the DB.
  const savedQuestions = await Question.insertMany(finalQuestions);

  return res.status(201).json(
    new ApiResponse(
      201,
      { count: savedQuestions.length, questions: savedQuestions },
      "Questions added successfully from Excel file"
    )
  );
});

export const addSingleQuestion = asyncHandler(async (req, res) => {
  const q = req.body;

  // Validate required fields
  if (
    !q.questionText ||
    !q.className ||
    !q.questionType ||
    !q.subject ||
    !q.topic ||
    !q.subTopic
  ) {
    throw new ApiError(
      400,
      `Missing required fields for question: ${q.questionText || "(no questionText provided)"}`
    );
  }

  // Build the question object according to your schema
  const newQuestion = {
    questionText: q.questionText,
    className: q.className,
    questionType: q.questionType,
    subject: q.subject,
    topic: q.topic,
    subTopic: q.subTopic,
    difficulty: q.difficulty || "Easy",
    tags: q.tags || [],
    explanation: q.explanation || "",
    bloomsTaxonomy: q.bloomsTaxonomy || "",
    createdBy: q.createdBy,

    // For MCQ / TRUE_FALSE questions
    options: q.options || [],
    correctAnswer: q.correctAnswer || "",

    // For MATCHING questions
    matchingPairs: q.matchingPairs || [],
       marks: q.marks || 0,
    // For CODING questions
    codingQuestion: q.codingQuestion || null,
  };

  // Additional validations based on question type

  // For MATCHING questions
  if (newQuestion.questionType === "MATCHING") {
    if (!Array.isArray(newQuestion.matchingPairs) || newQuestion.matchingPairs.length === 0) {
      throw new ApiError(
        400,
        `matchingPairs required for MATCHING question: ${q.questionText}`
      );
    }
  }

  // For CODING questions
  if (newQuestion.questionType === "CODING") {
    if (
      !newQuestion.codingQuestion ||
      !newQuestion.codingQuestion.problemStatement ||
      !newQuestion.codingQuestion.functionSignature
    ) {
      throw new ApiError(
        400,
        `codingQuestion fields are required for CODING question: ${q.questionText}`
      );
    }
  }

  // For MCQ and TRUE_FALSE questions, ensure options are provided
  if (
    ["MCQ", "TRUE_FALSE"].includes(newQuestion.questionType) &&
    (!newQuestion.options || newQuestion.options.length === 0)
  ) {
    throw new ApiError(
      400,
      `Options are required for MCQ / TRUE_FALSE question: ${q.questionText}`
    );
  }

  // Save the question in the database (using .save() for a single document)
  const savedQuestion = await new Question(newQuestion).save();

  return res.status(201).json(
    new ApiResponse(201, savedQuestion, "Question added successfully")
  );
});



export const getQuestionsByClassAndSubject = asyncHandler(async (req, res) => {
  const {  className, subject } = req.query;

  if (!className || !subject) {
    throw new ApiError(400, "Class and subject are required");
  }

  // Build a filter using regex for case-insensitive matching.
  const filter = {
    class: { $regex: new RegExp(`^${className}$`, "i") },
    subject: { $regex: new RegExp(`^${subject}$`, "i") }
  };

  const questions = await Question.find(filter);

  res.status(200).json({
    status: 200,
    message: "Questions fetched successfully",
    data: questions
  });
});
  


