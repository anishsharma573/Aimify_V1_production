import personalityTestData from '../data/personalityTestData.js';
import PersonalityTest from '../models/personalityTest.model.js';
import { ApiError } from '../utils/ApiError.js';
import PersonalityTestResponse from '../models/personalityTestResponse.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPersonalityTest = asyncHandler(async (req, res) => {
    let test = await PersonalityTest.findOne({ title: personalityTestData.title });
    if (test) {
      // Test already exists, so throw an error with a 409 Conflict status
      throw new ApiError(409, 'Personality test already exists');
    }
    test = new PersonalityTest(personalityTestData);
    const savedTest = await test.save();
    return res.status(201).json({
      success: true,
      data: savedTest,
      message: 'Personality test created successfully'
    });
  });
  

  export const getPersonalityTest = asyncHandler(async (req, res) => {
    const test = await PersonalityTest.findOne(); // Adjust if you have multiple tests
    if (!test) {
      throw new ApiError(404, 'Personality test not found');
    }
    return res.status(200).json({
      success: true,
      data: test,
      message: 'Test fetched successfully',
    });
  });

  
  export const submitPersonalityTestResponse = asyncHandler(async (req, res) => {
    // Expecting request body: { testId, responses: [{ questionLabel, answer }, ...], student }
    const { testId, responses, studentId } = req.body;
 
  
    // Validate required fields
    if (!testId || !responses || !studentId || !Array.isArray(responses) || responses.length === 0 || !studentId) {
      throw new ApiError(400, 'Missing required fields: testId, responses, and student ID');
    }
  
    // Retrieve the test definition by testId to check questions
    const test = await PersonalityTest.findById(testId);
    if (!test) {
      throw new ApiError(404, 'Personality test not found');
    }
  
    // Ensure that the number of responses matches the number of questions
    const totalQuestions = test.questions.length;
    if (responses.length !== totalQuestions) {
      throw new ApiError(400, `Please answer all ${totalQuestions} questions`);
    }
  
    // Verify that every question in the test has a corresponding response.
    const testQuestionLabels = test.questions.map(q => q.label).sort();
    const submittedLabels = responses.map(r => r.questionLabel).sort();
    if (testQuestionLabels.join(',') !== submittedLabels.join(',')) {
      throw new ApiError(400, 'Responses do not match the test questions. Please answer all questions correctly.');
    }
  
    // Define a mapping from answer option to mark (you can adjust the mapping)
    const scoreMapping = {
      "Strongly Disagree": 1,
      "Disagree": 2,
      "Not Sure": 3,
      "Agree": 4,
      "Strongly Agree": 5
    };
  
    // Process and validate each response by calculating its mark
    const processedResponses = responses.map(resp => {
      const { questionLabel, answer } = resp;
      if (!questionLabel || !answer) {
        throw new ApiError(400, 'Each response must include questionLabel and answer');
      }
      const mark = scoreMapping[answer];
      if (mark === undefined) {
        throw new ApiError(400, `Invalid answer option: ${answer}`);
      }
      return { questionLabel, answer, mark };
    });
  
    // Create a new document in PersonalityTestResponse with the processed responses
    const newResponse = new PersonalityTestResponse({
      student: studentId,
      test: testId,
      responses: processedResponses
    });
  
    const savedResponse = await newResponse.save();
  
    return res.status(201).json({
      success: true,
      data: savedResponse,
      message: 'Test response submitted successfully'
    });
  });

export const getTestResults = asyncHandler(async (req, res) => {
  // Extract the studentId from query parameters
  const { studentId } = req.query;
  
  // Validate that a studentId was provided
  if (!studentId) {
    throw new ApiError(400, "Student ID is required to fetch test responses");
  }
  
  // Retrieve responses for the given student
  const responses = await PersonalityTestResponse.find({ student: studentId })
    .populate({
      path: "student",
      select: "name username",
      model: "user"  // Use the registered model name (if registered as 'user')
    })
    .populate("test", "title description");
  
  if (!responses || responses.length === 0) {
    throw new ApiError(404, "No test responses found for the given student");
  }
  
  return res.status(200).json({
    success: true,
    data: responses,
    message: "Test responses for the student fetched successfully"
  });
});


export const checkTestSubmissionStatus = asyncHandler(async (req, res) => {
  // Extract studentId and optionally testId from query parameters
  const { studentId, testId } = req.query;
  
  // Validate that a studentId is provided
  if (!studentId) {
    throw new ApiError(400, "Student ID is required to check test submission status");
  }
  
  // Build the query; if testId is provided, include it in the query.
  const query = { student: studentId };
  if (testId) {
    query.test = testId;
  }
  
  // Retrieve the latest submission for this student (and test, if provided)
  const latestSubmission = await PersonalityTestResponse.findOne(query).sort({ createdAt: -1 });
  
  // Define the allowed retest period (e.g., one month in milliseconds; here 30 days)
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  
  if (latestSubmission) {
    const timeSinceSubmission = Date.now() - new Date(latestSubmission.createdAt).getTime();
    if (timeSinceSubmission < ONE_MONTH_MS) {
      return res.status(200).json({
        success: false,
        message: "You have already taken the test recently. You can retake it after one month.",
        // Optionally, provide the next allowed submission time:
        nextAllowedTime: new Date(new Date(latestSubmission.createdAt).getTime() + ONE_MONTH_MS)
      });
    }
  }
  
  // If no recent submission exists, the student is allowed to take the test
  return res.status(200).json({
    success: true,
    message: "You are allowed to take the test."
  });
});
