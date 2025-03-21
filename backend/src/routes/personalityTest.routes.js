import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import multer from "multer";
import { createPersonalityTest ,getPersonalityTest ,submitPersonalityTestResponse, getTestResults} from "../controllers/createPersonalityTest.controller.js";



const router = Router();

router.use(verifyJWT);


router.post('/',  createPersonalityTest);
router.get('/getTest',  getPersonalityTest);
router.post('/personality-test/response', submitPersonalityTestResponse);

// Route to retrieve test results (GET)
router.get('/personality-test/results', getTestResults);

export default router