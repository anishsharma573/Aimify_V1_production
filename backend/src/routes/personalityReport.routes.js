import express from 'express';

import { createPersonalityReport ,getPersonalityReportsByStudentId} from '../controllers/personalityReport.controllers.js';


const router = express.Router();


router.post('/create-personality-reports', createPersonalityReport);

// Route to get all personality reports
router.get('/get-all-personality-reports/:studentId', getPersonalityReportsByStudentId);

export default router;
