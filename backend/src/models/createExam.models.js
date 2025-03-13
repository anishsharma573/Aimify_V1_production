// models/Paper.js
import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    subTopic: {
      type: String,
      required: [true, 'Sub-topic is required'],
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;
