// controllers/paper.controllers.js
import Paper from "../models/createExam.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import PDFDocument from "pdfkit";
import { School } from "../models/school.models.js";
import "pdfkit-table"; // This line patches PDFDocument with doc.table
import moment from "moment";
// 1. Assign Paper (with Date)
export const assignPaper = asyncHandler(async (req, res) => {
  let {
    subject,
    examName,
    topic,
    subTopic,
    totalMarks,
    className,
    dateOfExam, // "19-03-2025" from client
  } = req.body;

  // Validate required fields
  if (!subject || !examName || !topic || !subTopic || !totalMarks || !className || !dateOfExam) {
    throw new ApiError(400, "Missing required fields: subject, examName, topic, subTopic, totalMarks, className, dateOfExam");
  }

  // Parse dateOfExam from "DD-MM-YYYY" -> JS Date
  const parsedDate = moment(dateOfExam, "DD-MM-YYYY", true); 
  if (!parsedDate.isValid()) {
    throw new ApiError(400, "Invalid date format. Use DD-MM-YYYY.");
  }

  // Additional validations: Ensure totalMarks is a positive number
  if (isNaN(totalMarks) || Number(totalMarks) <= 0) {
    throw new ApiError(400, "Total marks must be a positive number");
  }

  // Ensure teacher is logged in
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }

  const teacherId = req.user._id;
  const schoolId = req.user.schoolId;

  // Create the exam paper using the parsed Date object
  let paper = await Paper.create({
    subject,
    examName,
    topic,
    subTopic,
    totalMarks,
    school: schoolId,
    createdBy: teacherId,
    className,
    dateOfExam: parsedDate.toDate(), // <--- pass a real Date object
  });

  // Now Mongoose won't complain about casting
  // Next steps: fetch students, map results, save, etc.

  const students = await User.find({ schoolId, className, role: "student" });
  const results = students.map((student) => ({
    student: student._id,
    marksObtained: null,
  }));
  paper.results = results;
  await paper.save();

  res.status(201).json({
    status: 201,
    message: "Paper assigned successfully",
    data: {
      paper,
      studentCount: students.length,
    },
  });
});

// 2. Fetch Exams by Class, Subject, and Date (Month & Year)
export const getExamsByClass = asyncHandler(async (req, res) => {
  const {
    className, // from req.query or req.params
    subject,
    month,
    year,
  } = req.query; // or req.params, depending on your route setup

  if (!className || !subject || !month || !year) {
    throw new ApiError(400, "className, subject, month, and year are required");
  }

  // Convert month & year to numbers
  const numericMonth = parseInt(month, 10); // e.g., 9 for September
  const numericYear = parseInt(year, 10);   // e.g., 2023

  if (
    isNaN(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12 ||
    isNaN(numericYear) ||
    numericYear < 1970
  ) {
    throw new ApiError(400, "Invalid month or year");
  }

  // Build date range for the specified month & year
  // e.g., for Sep 2023, startDate = 2023-09-01, endDate = 2023-10-01
  const startDate = new Date(numericYear, numericMonth - 1, 1);
  const endDate = new Date(numericYear, numericMonth, 1);

  const schoolId = req.user.schoolId; // assuming req.user is set

  // Build the filter
  const filter = {
    school: schoolId,
    className: { $regex: new RegExp(`^${className}$`, "i") },
    subject: { $regex: new RegExp(`^${subject}$`, "i") },
    dateOfExam: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  const exams = await Paper.find(filter);

  res.status(200).json({
    status: 200,
    message: "Exams fetched successfully",
    data: exams,
  });
});

// 3. Get Paper by ID
export const getPaperById = asyncHandler(async (req, res) => {
  const { paperId } = req.params;

  // Ensure teacher is logged in
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }

  // Find the exam paper and populate student details
  const paper = await Paper.findById(paperId).populate("results.student", "name username role");
  if (!paper) {
    throw new ApiError(404, "Exam paper not found");
  }

  // Optional: Verify that the teacher is the creator of the paper
  if (paper.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view this exam");
  }

  res.status(200).json({
    status: 200,
    message: "Exam paper fetched successfully",
    data: paper,
  });
});

// 4. Update Exam Marks
export const updateExamMarks = asyncHandler(async (req, res) => {
  const { paperId, results: updates } = req.body;
  
  // Validate required fields
  if (!paperId || !Array.isArray(updates)) {
    throw new ApiError(400, "paperId and results array are required");
  }
  
  // Ensure teacher is logged in
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  
  // Find the exam paper and populate student details if needed.
  const paper = await Paper.findById(paperId).populate("results.student");
  if (!paper) {
    throw new ApiError(404, "Exam paper not found");
  }
  
  // Optional: Verify that the teacher updating the marks is the one who created the exam paper.
  if (paper.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update marks for this exam");
  }
  
  // Update each result entry based on the provided updates.
  paper.results = paper.results.map((result) => {
    const update = updates.find(
      (u) => u.student.toString() === result.student._id.toString()
    );
    if (update) {
      // Validate marks
      const marks = Number(update.marksObtained);
      if (isNaN(marks) || marks < 0 || marks > Number(paper.totalMarks)) {
        throw new ApiError(
          400,
          `Invalid marks for student ${result.student.name || result.student.username}`
        );
      }

      // Accept the new remarks, or default to an empty string if not provided
      const newRemarks = update.remarks || "";

      return {
        student: result.student._id,
        marksObtained: marks,
        remarks: newRemarks,
      };
    }
    return result;
  });
  
  await paper.save();
  
  res.status(200).json({
    status: 200,
    message: "Exam marks updated successfully",
    data: paper,
  });
});

// 5. Download Exam Results as PDF
export const downloadExamResultsPDF = asyncHandler(async (req, res) => {
  const { paperId } = req.params;
  if (!paperId) {
    throw new ApiError(400, "Paper ID is required");
  }

  // Fetch the exam paper and populate student details
  const paper = await Paper.findById(paperId).populate("results.student", "name username");
  if (!paper) {
    throw new ApiError(404, "Exam paper not found");
  }

  // Get school name if available
  let schoolName = "Your School Name";
  if (paper.school) {
    const school = await School.findById(paper.school);
    if (school && school.name) {
      schoolName = school.name;
    }
  }

  // Create PDF document
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  res.setHeader("Content-Disposition", 'attachment; filename="exam_results.pdf"');
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Helper: draw horizontal line
  const drawHLine = (y, fromX, toX, color = "#aaaaaa", lineWidth = 1) => {
    doc
      .moveTo(fromX, y)
      .lineTo(toX, y)
      .lineWidth(lineWidth)
      .strokeColor(color)
      .stroke();
  };

  // --- Header Section ---
  doc.font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#333333")
    .text(schoolName, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(18)
    .fillColor("#000000")
    .text("Exam Results", { align: "center" });
  doc.moveDown(1.5);

  // --- Exam Information ---
  doc.font("Helvetica")
    .fontSize(12)
    .fillColor("#333333");
  doc.text(`Exam Name: ${paper.examName}`);
  doc.text(`Topic: ${paper.topic}`);
  doc.text(`Sub-Topic: ${paper.subTopic}`);
  doc.text(`Total Marks: ${paper.totalMarks}`);
  doc.moveDown(1);

  // --- Table Header ---
  const startX = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const headerY = doc.y; // current Y position for header
  const rowHeight = 25;
  // Define column widths: adjust these percentages as needed.
  const col1Width = pageWidth * 0.4;
  const col2Width = pageWidth * 0.2;
  const col3Width = pageWidth * 0.4;
  const tableRightX = startX + col1Width + col2Width + col3Width;

  // Draw header backgrounds
  doc.fillColor("#1976D2");
  doc.rect(startX, headerY, col1Width, rowHeight).fill();
  doc.rect(startX + col1Width, headerY, col2Width, rowHeight).fill();
  doc.rect(startX + col1Width + col2Width, headerY, col3Width, rowHeight).fill();

  // Write header text
  const padding = 5;
  doc.fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(12);
  doc.text("Student Name", startX + padding, headerY + 7, { width: col1Width - 2 * padding, align: "left" });
  doc.text("Marks", startX + col1Width + padding, headerY + 7, { width: col2Width - 2 * padding, align: "left" });
  doc.text("Remarks", startX + col1Width + col2Width + padding, headerY + 7, { width: col3Width - 2 * padding, align: "left" });

  // Draw vertical lines in header (white lines)
  doc.strokeColor("#ffffff").lineWidth(1);
  doc.moveTo(startX + col1Width, headerY)
    .lineTo(startX + col1Width, headerY + rowHeight)
    .stroke();
  doc.moveTo(startX + col1Width + col2Width, headerY)
    .lineTo(startX + col1Width + col2Width, headerY + rowHeight)
    .stroke();

  // Draw horizontal line under header (white)
  drawHLine(headerY + rowHeight, startX, tableRightX, "#ffffff", 1);

  // --- Table Rows ---
  let currentY = headerY + rowHeight;
  doc.font("Helvetica").fontSize(11).fillColor("#333333");

  paper.results.forEach((result, index) => {
    // For alternate row shading
    if (index % 2 === 0) {
      doc.fillColor("#f2f2f2")
        .rect(startX, currentY, pageWidth, rowHeight)
        .fill();
    }
    doc.fillColor("#333333");
    // Student Name
    const studentName = result.student?.name || result.student?.username || "Unknown";
    doc.text(studentName, startX + padding, currentY + 7, { width: col1Width - 2 * padding, align: "left" });
    // Marks
    const marks = result.marksObtained !== null ? String(result.marksObtained) : "";
    doc.text(marks, startX + col1Width + padding, currentY + 7, { width: col2Width - 2 * padding, align: "left" });
    // Remarks
    const remarks = result.remarks || "";
    doc.text(remarks, startX + col1Width + col2Width + padding, currentY + 7, { width: col3Width - 2 * padding, align: "left" });

    // Draw a border around the row
    doc.strokeColor("#cccccc")
      .lineWidth(0.5)
      .rect(startX, currentY, pageWidth, rowHeight)
      .stroke();

    currentY += rowHeight;
    // If we are near the bottom of the page, add a new page
    if (currentY > doc.page.height - doc.page.margins.bottom - rowHeight) {
      // Draw vertical lines for the current table section before new page
      doc.strokeColor("#cccccc").lineWidth(0.5);
      doc.moveTo(startX, headerY).lineTo(startX, currentY).stroke();
      doc.moveTo(startX + col1Width, headerY).lineTo(startX + col1Width, currentY).stroke();
      doc.moveTo(startX + col1Width + col2Width, headerY).lineTo(startX + col1Width + col2Width, currentY).stroke();
      doc.moveTo(tableRightX, headerY).lineTo(tableRightX, currentY).stroke();

      doc.addPage();
      // Reset currentY to top margin of new page and redraw header if needed.
      currentY = doc.page.margins.top;
      // Optionally, redraw header on new page for continuity.
    }
  });

  // Draw full vertical lines across the table (from headerY to currentY)
  doc.strokeColor("#cccccc").lineWidth(0.5);
  doc.moveTo(startX, headerY).lineTo(startX, currentY).stroke();
  doc.moveTo(startX + col1Width, headerY).lineTo(startX + col1Width, currentY).stroke();
  doc.moveTo(startX + col1Width + col2Width, headerY).lineTo(startX + col1Width + col2Width, currentY).stroke();
  doc.moveTo(tableRightX, headerY).lineTo(tableRightX, currentY).stroke();

  // --- Footer ---
  doc.moveDown(1);
  drawHLine(doc.y, startX, tableRightX, "#aaaaaa", 1);
  doc.fontSize(10).fillColor("gray").text("Generated by Aimify System", { align: "center" });

  doc.end();
});

// 6. Set Paper Questions
export const setPaperQuestions = asyncHandler(async (req, res) => {
  const { paperId, questionIds } = req.body;

  // Validate required fields
  if (!paperId || !Array.isArray(questionIds)) {
    throw new ApiError(400, "paperId and an array of questionIds are required");
  }

  // Ensure teacher is logged in (req.user is set by your auth middleware)
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }

  // Find the exam paper
  const paper = await Paper.findById(paperId);
  if (!paper) {
    throw new ApiError(404, "Exam paper not found");
  }

  // Optionally verify that the teacher setting the questions is the one who created the paper.
  if (paper.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to set questions for this exam");
  }

  // Update the paper's questions array
  paper.questions = questionIds;
  await paper.save();

  res.status(200).json({
    status: 200,
    message: "Questions set successfully on the exam paper",
    data: paper
  });
});



// controllers/paper.controllers.js
export const getAllStudentResults = asyncHandler(async (req, res) => {
  // Must be a logged-in student
  if (!req.user || req.user.role !== "student") {
    throw new ApiError(401, "Not authorized");
  }

  // Find all papers that have this student's ID in their results array
  // Sort by dateOfExam descending so the newest exam is first
  const papers = await Paper.find({ "results.student": req.user._id })
    .sort({ dateOfExam: -1 });

  // Build an array of only the relevant info for each paper + the student's result
  const resultsData = papers.map((paper) => {
    // The result entry for this student
    const studentResult = paper.results.find(
      (r) => r.student.toString() === req.user._id.toString()
    );

    return {
      paperId: paper._id,
      examName: paper.examName,
      dateOfExam: paper.dateOfExam,
      topic: paper.topic,
      subTopic: paper.subTopic,
      totalMarks: paper.totalMarks,
      // Student-specific fields
      marksObtained: studentResult ? studentResult.marksObtained : null,
      remarks: studentResult ? studentResult.remarks : "",
    };
  });

  res.status(200).json({
    status: 200,
    message: "All exam results for this student",
    data: resultsData,
  });
});
