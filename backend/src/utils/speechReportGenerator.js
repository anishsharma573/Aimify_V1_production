// utils/speechReportGenerator.js
import getGPT4Response from './getGPT4Response.js';

function removeMarkdown(text) {
  if (!text) return null;
  const markdownRegExp = /(\*\*|__|`{1,3}|#{1,6}|>|-|\[|\]|\(|\)|!|\|)/gm;
  return text.replace(markdownRegExp, '');
}

function fixGPTOutput(jsonString) {
  if (!jsonString) return '';

  // Replace smart quotes
  jsonString = jsonString
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // Remove commas before closing brackets
  jsonString = jsonString
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*,/g, ',');

  // Fix missing array brackets after evaluation_breakdown
  jsonString = jsonString.replace(
    /"evaluation_breakdown"\s*:\s*{/, 
    '"evaluation_breakdown": [ {'
  );

  // Ensure we close the array before overall_conclusion
  jsonString = jsonString.replace(
    /}\s*,\s*"overall_conclusion"/, 
    '} ], "overall_conclusion"'
  );

  return jsonString;
}




async function generateSpeechReport(name, classLevel, gender, speechEvaluations) {
  const safe = (val) => JSON.stringify(String(val ?? 'Not Available').replace(/"/g, '\"').replace(/\n/g, ' '));

  const prompt = `
Generate a detailed speech assessment report  strictly in JSON format.
keep in mind the array in json it doesn not haver , at end the after last object of any array do not add comman  .. add one comma before overall_conclusion  and do not add comma after  domain Confidence object like after domain Confidence this bracket} The report should contain the following sections:

1. Overview: A brief overview of the test and student's overall performance.

2. Evaluation Breakdown: A list of domains. For each domain, keep the "score" and "remark" values exactly as provided. You must generate "observation" and "improvement" based on the score and remark.

If any parameter is missing, use "Not Available".

3. Conclusion: A final summary of the speaker's overall strengths and areas to work on.

4. add one comma before overall_conclusion  and do not add comma after  domain Confidence object like after domain Confidence this bracket}
All keys and values must use double quotes. Format should be like:

{
  "name": ${safe(name)},
  "class": ${safe(classLevel)},
  "gender": ${safe(gender)},
  "overview": "Please generate this based on the domain score and remark.",
  "evaluation_breakdown": [
    {
      "domain": "Language Proficiency",
      "score": ${safe(speechEvaluations.languageProficiency?.score)},
      "remark": ${safe(speechEvaluations.languageProficiency?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Speed",
      "score": ${safe(speechEvaluations.speed?.score)},
      "remark": ${safe(speechEvaluations.speed?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Pitch",
      "score": ${safe(speechEvaluations.pitch?.score)},
      "remark": ${safe(speechEvaluations.pitch?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Fillers",
      "score": ${safe(speechEvaluations.fillers?.score)},
      "remark": ${safe(speechEvaluations.fillers?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Grammar",
      "score": ${safe(speechEvaluations.grammar?.score)},
      "remark": ${safe(speechEvaluations.grammar?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Speech Structure",
      "score": ${safe(speechEvaluations.speechStructure?.score)},
      "remark": ${safe(speechEvaluations.speechStructure?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Accent",
      "score": ${safe(speechEvaluations.accent?.score)},
      "remark": ${safe(speechEvaluations.accent?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Neck & Eye Movements",
      "score": ${safe(speechEvaluations.neckEyeMovements?.score)},
      "remark": ${safe(speechEvaluations.neckEyeMovements?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Hand Movements",
      "score": ${safe(speechEvaluations.handMovements?.score)},
      "remark": ${safe(speechEvaluations.handMovements?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Body Movement/Posture",
      "score": ${safe(speechEvaluations.bodyMovementPosture?.score)},
      "remark": ${safe(speechEvaluations.bodyMovementPosture?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    },
    {
      "domain": "Confidence",
      "score": ${safe(speechEvaluations.confidence?.score)},
      "remark": ${safe(speechEvaluations.confidence?.remark)},
      "observation": "Please generate this based on the domain score and remark.",
      "improvement": "Please generate this based on the domain score and remark."
    }
  ],
 
}`;

  let result;
  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      result = await getGPT4Response(prompt);
      if (result && result.trim().length > 0) break;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error}`);
    }
    attempt++;
  }
  if (!result || result.trim().length === 0) {
    throw new Error("Failed to generate report from GPT after several attempts.");
  }

  const cleanedOutput = removeMarkdown(result);
  const fixedOutput = fixGPTOutput(cleanedOutput);

 
  return fixedOutput
}

export { generateSpeechReport, removeMarkdown };