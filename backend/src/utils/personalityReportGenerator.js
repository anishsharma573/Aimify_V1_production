// utils/personalityReportGenerator.js
import getGPT4Response from './getGPT4Response.js';

/** Optional helper that removes markdown. */
function PersonalityremoveMarkdown(text) {
  if (!text) return null;
  const str = typeof text === 'string' ? text : String(text);
  const markdownRegExp = /(\*\*|__|`{1,3}|#{1,6}|>|-|\[|\]|\(|\)|!|\|)/gm;
  return str.replace(markdownRegExp, '');
}

/** Optional fix-ups for extra commas, etc. */
function fixGPTOutput(jsonString) {
  let str = typeof jsonString === 'string' ? jsonString : String(jsonString || '');

  // 1. Standard fix-ups...
  str = str.replace(/^json\s*\n?/, '');
  str = str.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  str = str.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}').replace(/,\s*,/g, ',');

  // 2. SPECIFIC FIX: Convert a line like
  //   "skills_priorities": "Time management", "Communication", "Creative thinking", "Stress management"
  // to
  //   "skills_priorities": ["Time management", "Communication", "Creative thinking", "Stress management"]
  //
  // We'll do a regex that captures up to 4 entries. If GPT can produce variable numbers of items, you'd need a more dynamic fix.
  str = str.replace(
    /"skills_priorities"\s*:\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/,
    `"skills_priorities": ["$1", "$2", "$3", "$4"]`
  );

  return str;
}


/**
 * Generate a personality report in strict JSON format using the GPT-4/3.5 API.
 * @param {string} name
 * @param {string} gender
 * @param {string} classLevel
 * @param {string} school
 * @param {object} personalityScores
 * @returns {Promise<object>} - Parsed JSON from GPT
 */
export async function generatePersonalityReport(
  name,
  gender,
  classLevel,
  school,
  personalityScores = {}
) {
  console.log("[DEBUG] generatePersonalityReport received arguments:");
  console.log("  name:", name);
  console.log("  gender:", gender);
  console.log("  classLevel:", classLevel);
  console.log("  school:", school);
  console.log("  personalityScores:", personalityScores);

  // Safely convert values to a JSON-safe string
  const safe = (val) => JSON.stringify(
    String(val ?? 'Not Available').replace(/"/g, '\"').replace(/\n/g, ' ')
  );

  // Build the GPT prompt
 // Build the GPT prompt
const prompt = `
You are given personality scores and must return a JSON object. No extra text or keys, only valid JSON.
Your response MUST match exactly this structure (with no trailing commas):

{
  "name": "John Doe",
  "class": "10th Grade",
  "gender": "Not Available",
  "school": "New York",
  "personality_scores": {
    "neuroticism": "Low",
    "agreeableness": "High",
    "extraversion": "low",
    "conscientiousness": "High",
    "openness_to_experience": "High"
  },
  "domains": {
    "neuroticism": {
      "explanation": "Some explanation.",
      "remarks": "Some remarks.",
      "suggestions": "Suggestions for improvement."
    },
    "agreeableness": {
      "explanation": "Some explanation.",
      "remarks": "Some remarks.",
      "suggestions": "Suggestions for improvement."
    },
    "extraversion": {
      "explanation": "Some explanation.",
      "remarks": "Some remarks.",
      "suggestions": "Suggestions for improvement."
    },
    "conscientiousness": {
      "explanation": "Some explanation.",
      "remarks": "Some remarks.",
      "suggestions": "Suggestions for improvement."
    },
    "openness_to_experience": {
      "explanation": "Some explanation.",
      "remarks": "Some remarks.",
      "suggestions": "Suggestions for improvement."
    }
  },
  "overall_conclusion": "An overall conclusion on the personality assessment.",
  "skills_priorities": [
    "Time management",
    "Communication",
    "Creative thinking",
    "Stress management"
  ]
}

IMPORTANT NOTES:
- The key "skills_priorities" MUST be an array of strings (with square brackets).
- Do not remove the brackets or treat it as a single string.
- Do not add any trailing commas or extra fields.
- Do not add any additional commentary outside the JSON.
- If you break any of these rules, the response is invalid.
`;


  let rawGptOutput = "";
  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    attempt++;
    try {
      // CRUCIAL: We must await the function to get a string, not a promise.
      rawGptOutput = await getGPT4Response(prompt);
      if (rawGptOutput && rawGptOutput.trim().length > 0) break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }

  if (!rawGptOutput || rawGptOutput.trim().length === 0) {
    throw new Error("Failed to generate report from GPT after multiple attempts.");
  }

  console.log("[DEBUG] GPT raw output =>\n", rawGptOutput);

  // Remove markdown
  const cleanedOutput = PersonalityremoveMarkdown(rawGptOutput);

  // Fix common JSON formatting issues
  const fixedOutput = fixGPTOutput(cleanedOutput);

  try {
    const parsed = JSON.parse(fixedOutput);
    return parsed; // Return final JSON object
  } catch (error) {
    console.error("Failed to parse GPT response as JSON:", error);
    console.error("GPT raw output was:", fixedOutput);
    throw new Error("Failed to parse GPT response as JSON");
  }
}
