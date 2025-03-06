import Question from "../models/question.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import xlsx from "xlsx";
import { School } from "../models/school.models.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";


const addQuestion = asyncHandler(async (req, res, next) => {
    const {
        questionText,
        questionType,
        options,
        correctAnswer,
        difficulty,
        subject,
        topic,
        subTopic,
        tags,
        explanation,
        matchingPairs,
        codingQuestion,
        createdBy
    } = req.body;

    // Validate required fields
    if (!questionText || !questionType || !subject || !topic || !createdBy) {
        throw new ApiError(400, "All fields are required");
    }

    // Conditional validations
    if (["MCQ", "TRUE_FALSE"].includes(questionType) && (!options || options.length === 0)) {
throw new ApiError(400, "Options are required for MCQ and TRUE_FALSE questions");}

    if (questionType === "MATCHING" && (!matchingPairs || matchingPairs.length === 0)) {
throw new ApiError(400, "Matching pairs are required for MATCHING questions");}

    if (questionType === "CODING") {
        if (!codingQuestion?.problemStatement || !codingQuestion?.functionSignature) {
throw new ApiError(400, "Problem statement and function signature are required for CODING questions");}
    }

    // Create new question
    const newQuestion = new Question({
        questionText,
        questionType,
        options,
        correctAnswer,
        difficulty,
        subject,
        topic,
        subTopic,
        tags,
        explanation,
        matchingPairs,
        codingQuestion,
        createdBy
    });

    // Save to database
    const savedQuestion = await newQuestion.save();
    res.status(201).json({
        message: "Question added successfully",
        question: savedQuestion
    });

})


export {addQuestion}