import Paper from "../models/paper.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const setPaper = asyncHandler(async (req, res) => {
  const { title, class: className, subject, topic, subTopic, questionIds } = req.body;
  if (!title || !className || !subject || !topic || !subTopic || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw new ApiError(400, "Title, class, subject, topic, subTopic, and at least one question ID are required");
  }
  const newPaper = new Paper({
    title,
    class: className,
    subject,
    topic,
    subTopic,
    questions: questionIds,
    createdBy: req.user._id
  });
  const savedPaper = await newPaper.save();
  return res.status(201).json(new ApiResponse(201, { paper: savedPaper }, "Paper set successfully"));
});

export { setPaper };
