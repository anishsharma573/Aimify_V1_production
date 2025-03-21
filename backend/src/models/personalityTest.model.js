// models/personalityTest.model.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    label: { 
      type: String, 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    options: { 
      type: [String], 
      required: true,
      default: [
        "Strongly Disagree", 
        "Disagree", 
        "Not Sure", 
        "Agree", 
        "Strongly Agree"
      ]
    }
  },
  { _id: false } // Disable individual _id for questions
);

const personalityTestSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String,
      default: ''
    },
    questions: { 
      type: [questionSchema], 
      required: true 
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const PersonalityTest = mongoose.model('PersonalityTest', personalityTestSchema);

export default PersonalityTest;
