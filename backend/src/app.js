import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import multer from "multer"
const app = express()





// ----middleware---->>>

//cors who can talk to the database
// app.use(
//     cors({
// //       origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Frontend URL
// //       credentials: true, // Allow cookies to be sent
// //       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these HTTP methods
// //       allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
// //     })
// //   );
  
//   app.options("*", cors());
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

//routes 
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/schooladmin",schooladminRoutes)
app.use("/api/v1/questions",QuestionRoutes)


export default app