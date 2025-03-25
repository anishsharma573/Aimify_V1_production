// utils/generatePersonalityReportPDF.js

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Convert "High"/"Moderate"/"Low" to numeric. Adjust to your own logic.
 */
function mapScoreToNumber(score) {
  if (typeof score === 'string') {
    const map = { High: 80, Moderate: 50, Low: 20 };
    return map[score] ?? 0;
  }
  const num = Number(score);
  return isNaN(num) ? 0 : num;
}

/** Generate a random hex color, e.g. "#ae44bf". */
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Draw a simple bar chart by rendering colored rectangles with PDFKit.
 */
function drawBarChart(doc, scores, startX, startY) {
  doc.fontSize(12).fillColor('#000000').text('Bar Chart', startX, startY);
  const chartTop = startY + 25;

  const values = Object.values(scores);
  if (values.length === 0) {
    doc.fontSize(10).text('No data to display.', startX, chartTop);
    return;
  }
  const maxVal = Math.max(...values, 0);

  const barWidth = 40;
  const barGap = 60;
  let xPos = startX;
  const scaleHeight = 100;

  for (const [domain, val] of Object.entries(scores)) {
    const barHeight = maxVal > 0 ? (val / maxVal) * scaleHeight : 0;
    const yPos = chartTop + (scaleHeight - barHeight);

    const color = getRandomColor();
    doc.fillColor(color).rect(xPos, yPos, barWidth, barHeight).fill();

    doc
      .fillColor('#000000')
      .fontSize(8)
      .text(domain, xPos, chartTop + scaleHeight + 5, {
        width: barWidth,
        align: 'center'
      });
    doc
      .fontSize(8)
      .text(String(val), xPos, yPos - 10, {
        width: barWidth,
        align: 'center'
      });

    xPos += barGap;
  }
}

/**
 * Draw a pie chart using a path-based approach (SVG-like arc).
 */
function drawPieChart(doc, scores, centerX, centerY, radius) {
  doc.fontSize(12).fillColor('#000000').text('Pie Chart', centerX - radius, centerY - radius - 20);

  const allVals = Object.values(scores);
  const total = allVals.reduce((acc, v) => acc + v, 0);

  if (total <= 0) {
    doc.fontSize(10).text('No data to display.', centerX - radius, centerY);
    return;
  }

  let currentAngleDeg = 0;

  for (const [domain, val] of Object.entries(scores)) {
    const sliceDeg = (val / total) * 360;
    const startDeg = currentAngleDeg;
    const endDeg = startDeg + sliceDeg;

    const startRad = (Math.PI / 180) * startDeg;
    const endRad = (Math.PI / 180) * endDeg;

    const xStart = centerX + radius * Math.cos(startRad);
    const yStart = centerY + radius * Math.sin(startRad);
    const xEnd = centerX + radius * Math.cos(endRad);
    const yEnd = centerY + radius * Math.sin(endRad);
    const largeArcFlag = sliceDeg > 180 ? 1 : 0;

    const pathStr = [
      `M ${centerX} ${centerY}`,
      `L ${xStart} ${yStart}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${xEnd} ${yEnd}`,
      'Z'
    ].join(' ');

    const color = getRandomColor();
    doc.fillColor(color).path(pathStr).fill();

    const midDeg = startDeg + sliceDeg / 2;
    const midRad = (Math.PI / 180) * midDeg;
    const labelX = centerX + (radius / 2) * Math.cos(midRad);
    const labelY = centerY + (radius / 2) * Math.sin(midRad);
    doc
      .fillColor('#000000')
      .fontSize(8)
      .text(`${domain}: ${val}`, labelX - 15, labelY - 5, {
        width: 50,
        align: 'center'
      });

    currentAngleDeg += sliceDeg;
  }
}

/**
 * Main function to generate a 'cool & colorful' PDF for personality data.
 * It destructures the data into sections, prints them in a readable format,
 * and includes bar & pie charts for numeric interpretation.
 */
export async function generatePersonalityReportPDF(
  name,
  classLevel,
  gender,
  school,
  reportData
) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Unique file name
      const cleanedName = name.replace(/\s+/g, '_');
      const timestamp = Date.now();
      const fileName = `${cleanedName}_Personality_Report_${timestamp}.pdf`;
      const filePath = path.join(process.cwd(), 'public', 'reports', fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // -----------------------------------------------------------------------
      // (1) HEADER with Basic Info
      // -----------------------------------------------------------------------
      doc
        .fontSize(20)
        .text('Personality Report', { align: 'center' })
        .moveDown();

      doc
        .fontSize(12)
        .text(`Name: ${name}`)
        .text(`Class: ${classLevel}`)
        .text(`Gender: ${gender}`)
        .text(`School: ${school}`)
        .moveDown();

      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke()
        .moveDown();

      // -----------------------------------------------------------------------
      // (2) De-structure Key Fields from reportData
      // (We won't just dump all JSON. We'll style it in sections.)
      // -----------------------------------------------------------------------
      // Suppose your JSON structure is:
      // {
      //   "name": "...",
      //   "class": "...",
      //   "gender": "...",
      //   "school": "...",
      //   "personality_scores": {...},
      //   "domains": {
      //       "neuroticism": {...explanation, remarks, suggestions},
      //       ...
      //   },
      //   "overall_conclusion": "...",
      //   "skills_priorities": [...]
      // }

      // We'll read them safely:
      const {
        domains = {},
        overall_conclusion,
        skills_priorities
      } = reportData; // fallback if missing

      // (Optional) Print Personality Scores as Section
      doc.fontSize(12).text('Detailed Personality Data:', { underline: true }).moveDown(0.5);

      // Print each domain in a colorful style
      // The "domains" object might look like:
      //  { 
      //    "neuroticism": { explanation, remarks, suggestions },
      //    "agreeableness": {...}, ...
      //  }
      for (const [domainName, domainInfo] of Object.entries(domains)) {
        // random color for each domain heading
        const headingColor = getRandomColor();
        doc.fontSize(14).fillColor(headingColor).text(domainName.toUpperCase(), { bold: true });
        doc.fillColor('#000000').fontSize(10);

        if (domainInfo.explanation) {
          doc.text(`Explanation: ${domainInfo.explanation}`);
        }
        if (domainInfo.remarks) {
          doc.text(`Remarks: ${domainInfo.remarks}`);
        }
        if (domainInfo.suggestions) {
          doc.text(`Suggestions: ${domainInfo.suggestions}`);
        }
        doc.moveDown(1);
      }

      // (Optional) Print Overall Conclusion
      if (overall_conclusion) {
        doc
          .fontSize(12)
          .fillColor('#000000')
          .text('Overall Conclusion:', { underline: true })
          .moveDown(0.5);
        doc.fontSize(10).text(overall_conclusion).moveDown(1);
      }

      // (Optional) Print Skills Priorities as a bullet list
      if (Array.isArray(skills_priorities) && skills_priorities.length) {
        doc
          .fontSize(12)
          .fillColor('#000000')
          .text('Skills Priorities:', { underline: true })
          .moveDown(0.5);

        skills_priorities.forEach((skill) => {
          // Draw a small bullet
          const bulletX = doc.x;
          const bulletY = doc.y + 4;
          doc
            .circle(bulletX, bulletY, 2)
            .fillColor('#000000')
            .fill();
          // Move text a bit to the right
          doc.fillColor('#000000').text(`  ${skill}`, bulletX + 10, doc.y - 5);
          doc.moveDown(0.5);
        });

        doc.moveDown(1);
      }

      // -----------------------------------------------------------------------
      // (3) Now let's interpret the "personality_scores" for numeric charts
      // -----------------------------------------------------------------------
      const rawScores = reportData.personality_scores || {};
      const numericScores = {};
      for (const domain in rawScores) {
        numericScores[domain] = mapScoreToNumber(rawScores[domain]);
      }

      // (4) Insert a Bar Chart
      doc.moveDown(1);
      drawBarChart(doc, numericScores, 50, doc.y + 10);

      // (5) Insert a Pie Chart on a new page
      doc.addPage();
      drawPieChart(doc, numericScores, 300, 200, 100);

      // (6) FINALIZE the PDF
      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
