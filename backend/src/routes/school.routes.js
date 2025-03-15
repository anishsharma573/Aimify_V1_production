import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { getSchoolBySubdomain } from "../controllers/school.controllers.js"






const router = Router();


router.post("/getSchool", getSchoolBySubdomain);





export default router