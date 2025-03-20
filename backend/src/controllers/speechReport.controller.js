import SpeechReport from "../models/speechReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createSpeechReport = asyncHandler(async (req, res) => {
  const {
    user,
    languageProficiency,
    speed,
    pitch,
    fillers,
    grammar,
    speechStructure,
    accent,
    neckEyeMovements,
    handMovements,
    bodyMovementPosture,
    confidence,
    overallComments,
    createdBy
  } = req.body;

  // Validate required fields
  if (
    !user ||
    !languageProficiency ||
    !speed ||
    !pitch ||
    !fillers ||
    !grammar ||
    !speechStructure ||
    !accent ||
    !neckEyeMovements ||
    !handMovements ||
    !bodyMovementPosture ||
    !confidence||
    !createdBy
  ) {
    throw new ApiError(400, "Missing required fields for speech report");
  }

  const newReport = new SpeechReport({
    user,
    languageProficiency,
    speed,
    pitch,
    fillers,
    grammar,
    speechStructure,
    accent,
    neckEyeMovements,
    handMovements,
    bodyMovementPosture,
    confidence,
    overallComments,
    createdBy
  });

  const savedReport = await newReport.save();

  res.status(201).json(new ApiResponse(201, savedReport, "Speech report created successfully"));
});

/**
 * Get a Speech Report by its ID.
 */
export const getSpeechReportsForStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    if (!studentId) {
      throw new ApiError(400, "studentId is required");
    }
  
    // Find all speech reports where the "user" field matches the given studentId
    const reports = await SpeechReport.find({ user: studentId }).sort({ reportDate: -1 });
    
    // Optionally, check if reports array is empty and respond accordingly
    if (!reports.length) {
      throw new ApiError(404, "No speech reports found for this student");
    }
  
    res.status(200).json(new ApiResponse(200, reports, "Speech reports fetched successfully"));
  });
  