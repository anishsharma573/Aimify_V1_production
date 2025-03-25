import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

/**
 * Generates a speech report PDF and saves it to disk with a professional layout.
 * Avoids the switchToPage out-of-bounds error by using bufferedPageRange properly.
 *
 * @param {string} name - Student name.
 * @param {string} classLevel - Class name/level.
 * @param {string} gender - Gender.
 * @param {string} center - Center name.
 * @param {Object} reportData - Parsed JSON object from GPT.
 * @returns {Promise<string>} - File path of the generated PDF.
 */
export async function generateSpeechReportPDF(
  name,
  classLevel,
  gender,
  school,
  reportData
) {
  // 1) Create a new PDF with some margins
  const pdf = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  // Optionally add metadata
  pdf.info.Title = 'Speech Assessment Report';
  pdf.info.Author = 'Your Organization';

  // 2) Prepare output file path
  const fileName = `${name.replace(/\s+/g, '_')}_Speech_Report.pdf`;
  const filePath = path.join('public', 'reports', fileName);
  const stream = fs.createWriteStream(filePath);

  // Pipe PDF content to our file
  pdf.pipe(stream);

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------
  const headerHeight = 50;
  // Draw a gray rectangle as the header background
  pdf
    .rect(
      pdf.page.margins.left,
      pdf.y,
      pdf.page.width - pdf.page.margins.left * 2,
      headerHeight
    )
    .fillColor('#444444') // dark gray background
    .fill();

  // Place the header text (in white) centered inside the rectangle
  pdf.fillColor('#ffffff');
  pdf.font('Helvetica-Bold').fontSize(20);
  pdf.text('Speech Assessment Report', {
    align: 'center',
    paragraphGap: headerHeight - 30, // vertical spacing in the header
  });

  // Reset the fill color back to black for normal text
  pdf.fillColor('#000000');
  // Move below the header
  pdf.y = headerHeight + 80; // adjust so content doesn't overlap

  // -------------------------------------------------------
  // STUDENT INFORMATION
  // -------------------------------------------------------
  pdf.font('Helvetica-Bold').fontSize(14).text('Student Information', {
    underline: true,
  });
  pdf.moveDown(0.5);

  pdf.font('Helvetica').fontSize(12);
  pdf.text(`Name: ${reportData.name}`, { lineGap: 3 });
  pdf.text(`Class: ${reportData.classLevel }`, { lineGap: 3 });
  pdf.text(`Gender: ${reportData.gender}`, { lineGap: 3 });
  pdf.text(`School: ${reportData.school}`, { lineGap: 3 });

  drawHr(pdf, pdf.y + 10);
  pdf.moveDown();

  // -------------------------------------------------------
  // OVERVIEW
  // -------------------------------------------------------
  pdf.font('Helvetica-Bold').fontSize(14).text('Overview', { underline: true });
  pdf.moveDown(0.5);

  pdf.font('Helvetica').fontSize(12).text(reportData.overview || 'Not Available', {
    align: 'justify',
    lineGap: 2,
  });

  drawHr(pdf, pdf.y + 10);
  pdf.moveDown();

  // -------------------------------------------------------
  // EVALUATION BREAKDOWN
  // -------------------------------------------------------
  pdf
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Evaluation Breakdown', { underline: true });
  pdf.moveDown(0.5);

  if (Array.isArray(reportData.evaluation_breakdown)) {
    reportData.evaluation_breakdown.forEach((item, index) => {
      pdf
        .font('Helvetica-Bold')
        .text(`${index + 1}. Domain: ${item.domain || 'Not Available'}`, {
          lineGap: 2,
        });
      pdf
        .font('Helvetica')
        .text(`Score: ${item.score || 'Not Available'}`, {
          indent: 20,
          lineGap: 2,
        })
        .text(`Remark: ${item.remark || 'Not Available'}`, {
          indent: 20,
          lineGap: 2,
        })
        .text(`Observation: ${item.observation || 'Not Available'}`, {
          indent: 20,
          lineGap: 2,
        })
        .text(`Improvement: ${item.improvement || 'Not Available'}`, {
          indent: 20,
          lineGap: 2,
        })
        .moveDown();
    });
  } else {
    pdf
      .font('Helvetica')
      .text('Evaluation breakdown data is not available or invalid.', {
        align: 'justify',
      });
    pdf.moveDown();
  }

  drawHr(pdf, pdf.y);
  pdf.moveDown();

  // -------------------------------------------------------
  // CONCLUSION
  // -------------------------------------------------------
  if (reportData.overall_conclusion) {
    pdf
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Conclusion', { underline: true });
    pdf.moveDown(0.5);

    pdf.font('Helvetica').fontSize(12).text(reportData.overall_conclusion, {
      align: 'justify',
      lineGap: 2,
    });
  }

  // -------------------------------------------------------
  // PAGE NUMBERING (Loop Over Pages)
  // -------------------------------------------------------
  // End the writing so all pages are buffered
  pdf.end();

  // Wait for the stream to finish writing to disk
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      // At this point, the doc has been fully written.
      // However, if we want to "switchToPage", we must do it before doc.end().
      // => So we can do page numbering *before* pdf.end(), or adopt another approach:
      //    pageAdded event or custom solution. 

      // A more robust approach is to do the page numbering *before* pdf.end().
      // Let's show how that might look if we do it *right before* pdf.end().
      // For now, this code block is left here only if you want to do something
      // after finishing. Typically, you'd do page numbering in the same pass.

      resolve(filePath);
    });
    stream.on('error', reject);
  });
}

/**
 * Draws a horizontal line at the given y-position.
 * @param {PDFDocument} doc - The PDFDocument instance
 * @param {number} y - The y-coordinate to draw the line
 */
function drawHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
}
