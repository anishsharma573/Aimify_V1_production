import SpeechReport from "../models/speechReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateSpeechReport , removeMarkdown } from "../utils/speechReportGenerator.js";
import path from "path";
import {generateSpeechReportPDF} from "../utils/SpeechpdfGenerator.js";
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
    createdBy,
    
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
    createdBy,
      reportSent: false, // Initially, reportSent is false
    reportUrl: null,   // Initially, reportUrl is null
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
  

  export const generateAndSaveSpeechReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    if (!reportId) {
      throw new ApiError(400, "Report ID is required");
    }
  
    const reportDoc = await SpeechReport.findById(reportId).populate({
      path: 'user',
      select: 'name className gender profile role logo school',
      model: 'user'
    });
  
    if (!reportDoc) {
      throw new ApiError(404, "Speech report not found for the provided reportId");
    }
  
    if (reportDoc.reportGenerated) {
      return res.status(200).json(new ApiResponse(200, reportDoc, "Speech report has already been generated"));
    }
  
    const {
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
    } = reportDoc;
  
    const speechEvaluations = {
      "Language Proficiency": languageProficiency,
      "Speed": speed,
      "Pitch": pitch,
      "Fillers": fillers,
      "Grammar": grammar,
      "Speech Structure": speechStructure,
      "Accent": accent,
      "Neck & Eye Movements": neckEyeMovements,
      "Hand Movements": handMovements,
      "Body Movement/Posture": bodyMovementPosture,
      "Confidence": confidence
    };
  
    const user = reportDoc.user;
    if (!user) {
      throw new ApiError(400, "Associated user not found in the speech report");
    }
  
    const name = user.name;
    const classLevel = user.className;
    const gender = user.gender || "Not Provided";
    const school = user.school || "Not Provided";
  
    // Generate GPT-based report
    const generatedReportJSON = await generateSpeechReport(name,  school,classLevel, gender, speechEvaluations);
    console.log("[DEBUG] GPT raw output:\n", generatedReportJSON);
    let reportData;
    try {
      if (typeof generatedReportJSON === 'string') {
        reportData = JSON.parse(generatedReportJSON);
      } else if (typeof generatedReportJSON === 'object') {
        reportData = generatedReportJSON;
      } else {
        throw new Error("Invalid report format from GPT.");
      }
    } catch (err) {
      console.error("JSON parsing error:", err);
      // console.error("Generated Output:", generatedReportJSON);
      throw new ApiError(500, "Failed to parse generated report JSON");
    }
    
    
    
  
    // Generate PDF
    const pdfFilePath = await generateSpeechReportPDF(name, classLevel, gender, school, generatedReportJSON);
    const cleanedName = name.replace(/\s+/g, '_');
     const timestamp = Date.now(); // creates a unique number based on the current time
   const fileName = `${cleanedName}_Speech_Report_${timestamp}.pdf`;

  
    // Save to DB
    reportDoc.reportUrl = pdfFilePath;
    reportDoc.reportSent = true;
    reportDoc.reportGenerated = true;
    await reportDoc.save();
  
    // Return response with public URL
    return res.status(200).json(new ApiResponse(
      200,
      {
        ...reportDoc.toObject(),
        reportUrl: `${req.protocol}://${req.get('host')}/public/reports/${fileName}`
      },
      "Speech report generated and saved successfully"
    ));
  });
  
