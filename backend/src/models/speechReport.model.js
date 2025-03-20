import mongoose from "mongoose";

const speechReportSchema = new mongoose.Schema(
  {
    // Reference to the user who took the speech evaluation
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The date the report was generated
    reportDate: {
      type: Date,
      default: Date.now,
    },
    // Language Proficiency
    languageProficiency: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        // This enum is optional. If you want to allow any remark, remove `enum`.
        enum: [
          "Fluent",
          "Limited vocabulary",
          "Native-like",
          "Basic",
          "Advanced",
        ],
      },
    },
    // Speed
    speed: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Too fast",
          "Too slow",
          "Steady",
          "Rushed",
          "Variable pace",
        ],
      },
    },
    // Pitch
    pitch: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Flat",
          "High-pitched",
          "Low-pitched",
          "Modulated",
          "Monotone",
        ],
      },
    },
    // Fillers
    fillers: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Excessive",
          "Minimal",
          "Noticeable",
          "Frequent pauses",
          "Smooth delivery",
        ],
      },
    },
    // Grammar
    grammar: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        // Provide your grammar remarks here
        enum: [
          "Accurate",
          "Frequent errors",
          "Occasional slips",
          "Needs improvement",
          "Flawless",
        ],
      },
    },
    // Speech Structure
    speechStructure: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Well-organized",
          "Disorganized",
          "Clear flow",
          "Abrupt transitions",
          "Logical",
        ],
      },
    },
    // Accent
    accent: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Neutral",
          "Regional",
          "Heavy",
          "Light",
          "Distinct",
        ],
      },
    },
    // Neck & Eye Movements
    neckEyeMovements: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Engaging eye contact",
          "Avoids eye contact",
          "Stiff neck",
          "Natural gaze",
          "Nervous glances",
        ],
      },
    },
    // Hand Movements
    handMovements: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Overused",
          "Minimal",
          "Natural",
          "Jerky",
          "Distracting",
        ],
      },
    },
    // Body Movement / Posture
    bodyMovementPosture: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        enum: [
          "Steady posture",
          "Swaying",
          "Nervous gestures",
          "Confident stance",
          "Slouched",
        ],
      },
    },
    // Confidence
    confidence: {
      score: { type: Number, min: 0, max: 10 },
      remark: {
        type: String,
        // Provide your confidence remarks here
        enum: [
          "High",
          "Moderate",
          "Low",
          "Unsure",
          "Commanding",
        ],
      },
    },
    // Additional fields you might want:
    overallComments: {
      type: String,
    },
    reportGenerated:{
        type: Boolean,
        default: false

    },
    reportSent:{
        type: Boolean,
        default: false
    },
    reportUrl:{
        type: String 
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("SpeechReport", speechReportSchema);
