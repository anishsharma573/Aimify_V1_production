import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { addQuestion, chooseQuestions } from "../controllers/question.controllers.js";



const router = Router();

router.use(verifyJWT);
router.use(isMasterAdmin);
router.post("/add-question", addQuestion);
router.post("/choose-question", chooseQuestions);




export default router