import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

/**
 * Generates a speech report PDF and saves it to disk.
 * @param {string} name - Student name.
 * @param {string} classLevel - Class name/level.
 * @param {string} gender - Gender.
 * @param {string} center - Center name.
 * @param {Object} reportData - Parsed JSON object from GPT.
 * @returns {Promise<string>} - File path of the generated PDF.
 */
export async function generateSpeechReportPDF(name, classLevel, gender, center, reportData) {
  const pdf = new PDFDocument({ margin: 50 });

  const fileName = `${name.replace(/\s+/g, '_')}_Speech_Report.pdf`;
  const filePath = path.join('public', 'reports', fileName);

  const stream = fs.createWriteStream(filePath);
  pdf.pipe(stream);

  // Header
  pdf.fontSize(20).text('Speech Assessment Report', { align: 'center' });
  pdf.moveDown();

  // Student Info
  pdf.fontSize(12)
    .text(`Name: ${reportData.name}`)
    .text(`Class: ${reportData.class}`)
    .text(`Gender: ${reportData.gender}`)
    .text(`Center: ${center}`)
    .moveDown();

  // Overview
  pdf.fontSize(14).text('Overview', { underline: true });
  pdf.fontSize(12).text(reportData.overview || "Not Available");
  pdf.moveDown();

  // Evaluation Breakdown
  pdf.fontSize(14).text('Evaluation Breakdown', { underline: true });
  pdf.moveDown(0.5);

  if (Array.isArray(reportData.evaluation_breakdown)) {
    reportData.evaluation_breakdown.forEach((item, index) => {
      pdf.fontSize(12).text(`${index + 1}. Domain: ${item.domain}`);
      pdf.text(`   Score: ${item.score}`);
      pdf.text(`   Remark: ${item.remark}`);
      pdf.text(`   Observation: ${item.observation}`);
      pdf.text(`   Improvement: ${item.improvement}`);
      pdf.moveDown();
    });
  } else {
    pdf.fontSize(12).text('Evaluation breakdown data is not available or invalid.');
  }

  // Conclusion
  if (reportData.overall_conclusion) {
    pdf.fontSize(14).text('Conclusion', { underline: true });
    pdf.fontSize(12).text(reportData.overall_conclusion);
  }

  pdf.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}
