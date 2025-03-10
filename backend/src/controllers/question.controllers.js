import Question from "../models/question.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import xlsx from "xlsx";


const addQuestion = asyncHandler(async (req, res, next) => {
  let questionsData = [];
  if (req.file) {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      throw new ApiError(400, "No question records found in file");
    }
    questionsData = sheetData;
  } else {
    if (req.body.questions) {
      questionsData = Array.isArray(req.body.questions)
        ? req.body.questions
        : [req.body.questions];
    } else {
      questionsData = [req.body];
    }
  }

  let newQuestionsData = [];
  for (const q of questionsData) {
    if (!q.questionText || !q.questionType || !q.subject || !q.topic || !q.createdBy) {
      throw new ApiError(400, "All fields are required for question: " + (q.questionText || ""));
    }
    if (["MCQ", "TRUE_FALSE"].includes(q.questionType) && (!q.options || q.options.length === 0)) {
      throw new ApiError(400, "Options are required for MCQ and TRUE_FALSE questions for question: " + q.questionText);
    }
    if (q.questionType === "MATCHING" && (!q.matchingPairs || q.matchingPairs.length === 0)) {
      throw new ApiError(400, "Matching pairs are required for MATCHING questions for question: " + q.questionText);
    }
    if (q.questionType === "CODING") {
      if (!q.codingQuestion || !q.codingQuestion.problemStatement || !q.codingQuestion.functionSignature) {
        throw new ApiError(400, "Problem statement and function signature are required for CODING questions for question: " + q.questionText);
      }
    }
    newQuestionsData.push({
        class: q.class,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      subject: q.subject,
      topic: q.topic,
      subTopic: q.subTopic,
      tags: q.tags,
      explanation: q.explanation,
      matchingPairs: q.matchingPairs,
      codingQuestion: q.codingQuestion,
      createdBy: q.createdBy
    });
  }

  if (newQuestionsData.length === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "No questions to upload"));
  }

  const savedQuestions = await Question.insertMany(newQuestionsData);
  return res.status(201).json(new ApiResponse(201, { questions: savedQuestions }, "Questions added successfully"));
});



const chooseQuestions = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.class) filter["class"] = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.subTopic) filter.subTopic = req.query.subTopic;
    if (req.query.questionType) filter.questionType = req.query.questionType;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(",") };
  
    if (req.query.random === "true") {
      const sampleSize = req.query.limit ? Number(req.query.limit) : 10;
      const questions = await Question.aggregate([{ $match: filter }, { $sample: { size: sampleSize } }]);
      return res.status(200).json(new ApiResponse(200, { questions }, "Random questions retrieved successfully"));
    } else {
      let query = Question.find(filter);
      if (req.query.limit) query = query.limit(Number(req.query.limit));
      const questions = await query.exec();
      return res.status(200).json(new ApiResponse(200, { questions }, "Questions retrieved successfully"));
    }
  });
  

export { addQuestion , chooseQuestions };
