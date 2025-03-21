// getGPT4Response.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

//const OPENAI_API_KEY = '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'; 
/**
 * Calls the GPT-4 API with the given prompt and returns the response.
 * Logs detailed error information if the call fails.
 * @param {string} prompt - The prompt to send to GPT-4.
 * @returns {Promise<string>} - The GPT-4 response as a string.
 */
async function getGPT4Response(prompt) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // change to 'gpt-4' if you have access
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 16384,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (parseErr) {
        errorDetails = 'Unable to parse error response as JSON';
      }
      throw new Error(`GPT API Error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorDetails)}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices.length) {
      throw new Error('GPT API returned no choices.');
    }
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in getGPT4Response:", error);
    throw error;
  }
}

export default getGPT4Response;
