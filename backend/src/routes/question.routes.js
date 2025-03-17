import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { getQuestionsByClassAndSubject, addSingleQuestion , addQuestionFromExcel , addQuestionFromJson } from "../controllers/question.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });


const router = Router();

router.use(verifyJWT);
router.get("/getQuestions", getQuestionsByClassAndSubject);
router.use(isMasterAdmin);
router.post("/add-single-question", addSingleQuestion);
router.post("/add-json-file-question", addQuestionFromJson);
router.post("/add-excel-question",  upload.single('file'),addQuestionFromExcel);




export default router