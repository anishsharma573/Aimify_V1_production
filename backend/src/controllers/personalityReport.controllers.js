
import PersonalityData from "../models/personalityReport.models.js";
import { ApiError } from "../utils/ApiError.js"; // Assuming you have an ApiError class to handle errors
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to create a new Personality Report
export const createPersonalityReport = asyncHandler(async (req, res) => {
  const {
    user,
    neuroticism,
    agreeableness,
    extraversion,
    conscientiousness,
    opennessToExperience,
    gender,
    age,
    center,
    id,
    createdBy,
  } = req.body;

  // Validate required fields
  if (
    !user ||
    !neuroticism ||
    !agreeableness ||
    !extraversion ||
    !conscientiousness ||
    !opennessToExperience ||
    !gender ||
    !age ||
    !center ||
    !id ||
    !createdBy
  ) {
    throw new ApiError(400, "Missing required fields for personality data");
  }

  // Create a new personality report
  const newPersonalityData = new PersonalityData({
    user,
    neuroticism,
    agreeableness,
    extraversion,
    conscientiousness,
    opennessToExperience,
    gender,
    age,
    center,
    id,
    createdBy,
    reportSent: false, // Initially, reportSent is false
    reportUrl: null,   // Initially, reportUrl is null
  });

  // Save the personality report
  await newPersonalityData.save();

  res.status(201).json({
    message: "Personality data created successfully",
    data: newPersonalityData,
  });
});

// Controller to get all previously created personality reports

export const getPersonalityReportsByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params; 
  
    const reports = await PersonalityData.find({ user: studentId })
      
  
    // If no reports are found for the student
    if (!reports || reports.length === 0) {
      throw new ApiError(404, "No personality reports found for this student");
    }
  
    // Return the fetched reports
    res.status(200).json({
      message: "Personality reports fetched successfully",
      data: reports,
    });
  });
  