import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import multer from "multer";
import { createPersonalityTest ,getPersonalityTest ,checkTestSubmissionStatus, submitPersonalityTestResponse, getTestResults} from "../controllers/createPersonalityTest.controller.js";



const router = Router();

router.use(verifyJWT);


router.post('/',  createPersonalityTest);
router.get('/getTest',  getPersonalityTest);
router.post('/personality-test/response', submitPersonalityTestResponse);

// Route to retrieve test results (GET)
router.get('/personality-test/results', getTestResults);
router.get('/personality-test/status', checkTestSubmissionStatus);

export default router