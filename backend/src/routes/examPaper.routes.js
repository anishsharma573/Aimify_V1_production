import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { addQuestionsToExamPaper, createExamPaper, getQuestionsByClassTopicSubtopic } from "../controllers/examPaper.controller.js";


const router = Router();

router.use(verifyJWT);

router.post("/exam-paper", createExamPaper);
router.post("/exam-paper/add-questions", addQuestionsToExamPaper);
router.get("/questions/filter", getQuestionsByClassTopicSubtopic);


// router.post("/update/exam", assignPaper); 




export default router