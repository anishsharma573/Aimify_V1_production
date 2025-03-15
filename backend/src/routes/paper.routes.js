import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { assignPaper ,getExamsByClass,getStudentsByClass , updateExamMarks} from "../controllers/paper.controllers.js";


const router = Router();

router.use(verifyJWT);


router.post("/create/exam", assignPaper); 
router.get("/exams/:className", getExamsByClass);
router.get("/students/:className", getStudentsByClass);

router.patch("/:paperId/results", updateExamMarks);


// router.post("/update/exam", assignPaper); 




export default router