import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    questionType: {
        type: String,
        enum: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_THE_BLANK', 'MATCHING', 'ESSAY', 'CODING'],
        required: true
    },
    options: {
        type: [String], // Only for MCQ & TRUE_FALSE
        validate: {
            validator: function (value) {
                return this.questionType === 'MCQ' || this.questionType === 'TRUE_FALSE' ? Array.isArray(value) && value.length > 0 : true;
            },
            message: 'Options are required for MCQ and TRUE_FALSE questions.'
        }
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // String, Array, or Object depending on type
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    subject: {
        type: String, // Example: 'Mathematics', 'Science'
        required: true,
        trim: true
    },
    topic: {
        type: String, // Broad category under subject
        required: true,
        trim: true
    },
    subTopic: {
        type: String, // More specific within the topic
        trim: true
    },
    tags: {
        type: [String], // Additional categorization (e.g., ['algebra', 'trigonometry'])
        default: []
    },
    explanation: {
        type: String, // Explanation for correct answer
        default: ''
    },
    matchingPairs: {
        type: [{
            question: String,
            answer: String
        }],
        validate: {
            validator: function (value) {
                return this.questionType === 'MATCHING' ? Array.isArray(value) && value.length > 0 : true;
            },
            message: 'Matching pairs are required for MATCHING questions.'
        }
    },
    codingQuestion: {
        problemStatement: {
            type: String,
            required: function () {
                return this.questionType === 'CODING';
            }
        },
        functionSignature: {
            type: String, // Expected function format (e.g., "def add(a, b):")
            required: function () {
                return this.questionType === 'CODING';
            }
        },
        constraints: {
            type: [String], // Any restrictions on inputs/outputs
            default: []
        },
        sampleTestCases: [{
            input: String,
            expectedOutput: String
        }],
        hints: {
            type: [String], // Helpful hints for solving the problem
            default: []
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // User who created the question
        ref: 'User',
        required: true
    },
    isVerified: {
        type: Boolean, // True if question is verified
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId, // Admin/moderator verifying the question
        ref: 'User'
    },
    verificationDate: {
        type: Date // When the question was verified
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Middleware to update `updatedAt` timestamp
questionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Question = mongoose.model('Question', questionSchema);

export default Question
