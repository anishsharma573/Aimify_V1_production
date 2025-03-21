import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { createSpeechReport ,generateAndSaveSpeechReport, getSpeechReportsForStudent} from "../controllers/speechReport.controller.js";


const router = Router();

router.use(verifyJWT)
;
//school admin
router.post("/create-speech-report", verifyJWT, createSpeechReport);
router.get("/student/:studentId", verifyJWT, getSpeechReportsForStudent);
router.put('/generate/:reportId', generateAndSaveSpeechReport);
export default router