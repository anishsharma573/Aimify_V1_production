import mongoose from "mongoose";

// Define the schema for PersonalityData with the new fields
const personalityDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model to get name and className
      required: true,
    },
    neuroticism: {
      type: String,
      required: true,
    },
    agreeableness: {
      type: String,
      required: true,
    },
    extraversion: {
      type: String,
      required: true,
    },
    conscientiousness: {
      type: String,
      required: true,
    },
    opennessToExperience: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    center: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who created the personality data
      required: true,
    },
    reportSent: {
      type: Boolean,
      default: false, // Indicates whether the report has been sent or not
    },
    reportUrl: {
      type: String, // URL of the report, which can be set after generation or when the report is created
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);

// Create a Mongoose model based on the schema
const PersonalityData = mongoose.model("PersonalityData", personalityDataSchema);

export default PersonalityData;
