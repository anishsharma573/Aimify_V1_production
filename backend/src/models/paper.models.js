// paper.models.js
import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    examName: { type: String, required: true },
    topic: { type: String, required: true },
    subTopic: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    className: { type: String, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    results: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        marksObtained: { type: Number, default: null },
      },
    ],
    // New field: an array of question ObjectIDs
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
    ],
    status: { type: String, enum: ["pending", "active"], default: "pending" },
  },
  { timestamps: true }
);

const Paper = mongoose.model("Paper", paperSchema);
export default Paper;
