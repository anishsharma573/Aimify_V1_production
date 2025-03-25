
import PersonalityData from "../models/personalityReport.models.js";
import { ApiError } from "../utils/ApiError.js"; // Assuming you have an ApiError class to handle errors
import { asyncHandler } from "../utils/asyncHandler.js";
import { generatePersonalityReport  } from "../utils/personalityReportGenerator.js";
import { generatePersonalityReportPDF } from "../utils/generatePersonalityReportPDF.js";


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
    school,
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
    !school ||
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
    school,
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
  
  export const generateAndSavePersonalityReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    if (!reportId) {
      throw new ApiError(400, "Report ID is required");
    }
  
    const reportDoc = await PersonalityData.findById(reportId).populate({
      path: 'user',
      select: 'name className gender school',
      model: 'user'
    });
  
    if (!reportDoc) {
      throw new ApiError(404, "Personality report not found for the provided reportId");
    }
  
    // If the report is already generated, return early
    if (reportDoc.reportGenerated) {
      return res.status(200).json({
        message: "Personality report has already been generated",
        data: reportDoc
      });
    }
  
    // Prepare personality scores
    const personalityScores = {
      neuroticism: reportDoc.neuroticism,
      agreeableness: reportDoc.agreeableness,
      extraversion: reportDoc.extraversion,
      conscientiousness: reportDoc.conscientiousness,
      opennessToExperience: reportDoc.opennessToExperience
    };
  
    // Extract user
    const user = reportDoc.user;
    if (!user) {
      throw new ApiError(400, "Associated user not found in the personality report");
    }
  
    const name = user.name ?? "Not Available";
    const classLevel = user.className ?? "Not Available";
    const gender = user.gender ?? "Not Available";
    const school = reportDoc.school ?? user.school ?? "Not Available";
  
    // This must be awaited:
    const generatedReportJSON = await generatePersonalityReport(
      name,
      gender,
      classLevel,
      school,
      personalityScores
    );
  
    console.log("[DEBUG] Final GPT JSON object =>\n", generatedReportJSON);
  
    // Generate PDF
    const pdfFilePath = await generatePersonalityReportPDF(
      name,
      classLevel,
      gender,
      school,
      generatedReportJSON
    );
  
    // Save changes
    const fileName = `${name.replace(/\s+/g, '_')}_Personality_${Date.now()}.pdf`;
    reportDoc.reportUrl = pdfFilePath;
    reportDoc.reportSent = true;
    reportDoc.reportGenerated = true;
    await reportDoc.save();
  
    // Return final response
    return res.status(200).json({
      message: "Personality report generated and saved successfully",
      data: {
        ...reportDoc.toObject(),
        reportUrl: `${req.protocol}://${req.get('host')}/public/reports/${fileName}`
      }
    });
  });
  

  