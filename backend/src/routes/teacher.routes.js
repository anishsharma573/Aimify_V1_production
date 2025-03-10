import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { teacherLogin } from "../controllers/teachers.controllers.js";



const router = Router();


//school admin
router.post("/login",verifyJWT,teacherLogin);

export default router