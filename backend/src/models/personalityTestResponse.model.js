// models/personalityTestResponse.model.js
import mongoose from 'mongoose';

// Define a schema for an individual response
const responseSchema = new mongoose.Schema({
  questionLabel: { type: String, required: true },  // e.g., "Ques1"
  answer: { type: String, required: true },         // e.g., "Agree"
  mark: { type: Number, required: true }            // e.g., 4 (score based on the answer)
}, { _id: false }); // No separate _id for each response object

// Define the main schema for the test responses
const personalityTestResponseSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    test: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'PersonalityTest', 
      required: true 
    },
    responses: { 
      type: [responseSchema], 
      required: true 
    }
  },
  { timestamps: true }
);

const PersonalityTestResponse = mongoose.model('PersonalityTestResponse', personalityTestResponseSchema);

export default PersonalityTestResponse;
