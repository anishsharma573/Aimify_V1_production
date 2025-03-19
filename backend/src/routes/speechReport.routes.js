import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";


const router = Router();

router.use(verifyJWT)

//school admin
router.post("/speech-report", authMiddleware, createSpeechReport);
router.get("/speech-report/student/:studentId", authMiddleware, getSpeechReportsForStudent);

export default router