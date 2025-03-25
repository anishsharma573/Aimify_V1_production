// models/personalityTestResponse.model.js
import mongoose from 'mongoose';
const responseSchema = new mongoose.Schema({
  questionLabel: { type: String, required: true },
  questionText: { type: String }, // Add this field
  answer: { type: String, required: true },
  mark: { type: Number, required: true }
}, { _id: false });

const personalityTestResponseSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonalityTest', required: true },
  responses: [responseSchema]
}, { timestamps: true });

 const PersonalityTestResponse = mongoose.model('PersonalityTestResponse', personalityTestResponseSchema);

export default PersonalityTestResponse;
