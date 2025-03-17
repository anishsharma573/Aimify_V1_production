import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    className:{
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
                if (this.questionType === 'MCQ' || this.questionType === 'TRUE_FALSE') {
                    return Array.isArray(value) && value.length > 0;
                }
                return true;
            },
            message: 'Options are required for MCQ and TRUE_FALSE questions.'
        }
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Could be a String, Array, or Object depending on type
        required: false
        // Optionally, add custom validation based on questionType
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'EASY'
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        index: true  // Added index for improved query performance
    },
    topic: {
        type: String,
        required: true,
        trim: true,
        index: true  // Added index for improved query performance
    },
    subTopic: {
        type: String,
        trim: true
    },
    tags: {
        type: [String], // Additional categorization (e.g., ['algebra', 'trigonometry'])
        default: []
    },
    explanation: {
        type: String,
        default: ''
    },
    bloomsTaxonomy:{
        type: String,

    },
    matchingPairs: {
        type: [{
            question: String,
            answer: String
        }],
        validate: {
            validator: function (value) {
                if (this.questionType === 'MATCHING') {
                    return Array.isArray(value) && value.length > 0;
                }
                return true;
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
            type: String,

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
        required: false
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
    }
}, { timestamps: true }); // This option automatically adds createdAt and updatedAt

const Question = mongoose.model('Question', questionSchema);

export default Question;
