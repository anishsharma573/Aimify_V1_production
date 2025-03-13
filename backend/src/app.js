import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import multer from "multer"
const app = express()





// ----middleware---->>>

// cors who can talk to the database
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin contains "localhost:5173"
      if (origin.includes("localhost:5173")) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
  
  app.options("*", cors());
// --- express middleware --->>

app.use(express.json());
const upload = multer({ dest: "uploads/" });
app.use(upload.single("file"));
app.use(express.json({limit:"16kb"})) // allow all the json data to come in..
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(bodyParser.json());
app.use(cookieParser())

// import routes
import userRoutes from "./routes/user.routes.js"
import schooladminRoutes from "./routes/schooladmin.routes.js"
import QuestionRoutes from "./routes/question.routes.js"
import studentRoutes from "./routes/student.routes.js"
import teacherRoutes from "./routes/teacher.routes.js"

//routes 
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/schooladmin",schooladminRoutes)
app.use("/api/v1/questions",QuestionRoutes)
app.use("/api/v1/student",studentRoutes)
app.use("/api/v1/teacher",teacherRoutes)


export default app