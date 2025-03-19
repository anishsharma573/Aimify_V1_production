import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();

// ---- CORS Setup ----
app.use(cors({
  origin: "*", // Allows all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors()); // Handles preflight requests for all routes


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
// ---- Use Routes ----
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/schooladmin", schooladminRoutes);
app.use("/api/v1/questions", QuestionRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/school", schoolRoutes);
app.use("/api/v1/exam", ExamRoutes);
app.use("/api/v1/set-paper", ExamPaperRoutes);

export default app;
