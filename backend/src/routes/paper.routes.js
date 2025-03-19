import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { assignPaper , updateExamMarks,getExamsByClass, getPaperById,getAllStudentResults, setPaperQuestions,downloadExamResultsPDF} from "../controllers/paper.controllers.js";


const router = Router();
router.get("/download/:paperId", downloadExamResultsPDF);
router.use(verifyJWT);


router.post("/create/exam", assignPaper); 
router.put("/update-marks", updateExamMarks);
router.get("/exams", getExamsByClass);
router.get("/:paperId", getPaperById);
router.get("/exam/student/all-results", verifyJWT, getAllStudentResults);
router.put("/set-paper-questions", setPaperQuestions);




// router.post("/update/exam", assignPaper); 




export default router