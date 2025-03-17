import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { assignPaper , updateExamMarks,getExamsByClass, getPaperById, setPaperQuestions,downloadExamResultsPDF} from "../controllers/paper.controllers.js";


const router = Router();
router.get("/download/:paperId", downloadExamResultsPDF);
router.use(verifyJWT);


router.post("/create/exam", assignPaper); 
router.put("/update-marks", updateExamMarks);
router.get("/exams/:className", getExamsByClass);
router.get("/:paperId", getPaperById);

router.put("/set-paper-questions", setPaperQuestions);




// router.post("/update/exam", assignPaper); 




export default router