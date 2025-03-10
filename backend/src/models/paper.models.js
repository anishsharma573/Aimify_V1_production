import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    subTopic: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Paper", paperSchema);
