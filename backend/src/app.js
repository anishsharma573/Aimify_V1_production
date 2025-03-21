import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use('/public', express.static(path.join(__dirname, 'public')));
// ---- CORS Setup ----
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true); // Allows requests without an origin (e.g., curl)
    }
    if (origin.includes("localhost")|| origin.includes(".")) {
      return callback(null, true); // Allow localhost (adjust if needed)
    } else {
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "schoolurl"], // Add schoolurl here
}));

app.options("*", cors()); // Handle preflight requests



// ---- Express Middlewares ----
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));

// ---- Import Routes ----
import userRoutes from "./routes/user.routes.js";
import schooladminRoutes from "./routes/schooladmin.routes.js";
import QuestionRoutes from "./routes/question.routes.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import ExamRoutes from "./routes/paper.routes.js";
import ExamPaperRoutes from "./routes/examPaper.routes.js";
import SpeechReportRoutes from "./routes/speechReport.routes.js";
import PersonalityReportRoutes from "./routes/personalityReport.routes.js";
import PersonalityTestRoutes from "./routes/personalityTest.routes.js";
// ---- Use Routes ----
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/schooladmin", schooladminRoutes);
app.use("/api/v1/questions", QuestionRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/school", schoolRoutes);
app.use("/api/v1/exam", ExamRoutes);
app.use("/api/v1/set-paper", ExamPaperRoutes);
app.use("/api/v1/speechReport", SpeechReportRoutes);
app.use("/api/v1/personalityReport", PersonalityReportRoutes);
app.use("/api/v1/personalityTest", PersonalityTestRoutes);

export default app;
