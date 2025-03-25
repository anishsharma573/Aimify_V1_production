import express from 'express';

import { createPersonalityReport ,getPersonalityReportsByStudentId} from '../controllers/personalityReport.controllers.js';

import { generateAndSavePersonalityReport } from '../controllers/personalityReport.controllers.js';
const router = express.Router();


router.post('/create-personality-reports', createPersonalityReport);

// Route to get all personality reports
router.get('/get-all-personality-reports/:studentId', getPersonalityReportsByStudentId);
router.put('/generate/:reportId', generateAndSavePersonalityReport);
export default router;
