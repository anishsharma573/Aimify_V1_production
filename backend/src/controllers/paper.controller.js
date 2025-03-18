import Question from "../models/question.models.js";

export const getFilteredQuestions = asyncHandler(async (req, res) => {
  const { className, subject, topic, subTopic } = req.query;
  
  // Build filter object dynamically based on available query parameters.
  const filter = {};
  if (className) {
    filter.className = className;
  }
  if (subject) {
    filter.subject = subject;
  }
  if (topic) {
    filter.topic = topic;
  }
  if (subTopic) {
    filter.subTopic = subTopic;
  }
  
  // Optionally, you could add pagination here (skip, limit, etc.)
  const questions = await Question.find(filter);
  
  res.status(200).json({
    status: 200,
    message: "Questions retrieved successfully",
    data: { questions },
  });
});
