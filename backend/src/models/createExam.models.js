import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    examName: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    subTopic: {
      type: String,
      required: [true, "Sub-topic is required"],
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (User) is required"],
    },
    // Store the class name as a simple string (renamed to "className")
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    results: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        marksObtained: {
          type: Number,
          default: null,
        },
        remarks: { type: String, default: "" },
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Paper", paperSchema);
