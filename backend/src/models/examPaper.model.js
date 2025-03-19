import mongoose from "mongoose";

const examPaperSchema = new mongoose.Schema({
  examName: { 
    type: String, 
    required: true 
  },
  className: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String,
    required: true 
  },
  // An array of question IDs referencing the Question model.
  questions: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question", 
      required: true
    }
  ],
  totalMarks: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  },
});

// Pre-save hook to calculate total marks.
examPaperSchema.pre("save", async function (next) {
  if (this.questions && this.questions.length > 0) {
    // Get the Question model.
    const Question = mongoose.model("Question");
    // Fetch all questions referenced in this exam paper.
    const questions = await Question.find({ _id: { $in: this.questions } });
    // Sum up the marks for all questions.
    // Convert q.marks to a number just in case
    this.totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  }
  next();
});

export default mongoose.model("ExamPaper", examPaperSchema);
