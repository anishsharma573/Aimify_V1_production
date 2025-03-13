import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { studentLogin } from "../controllers/students.controllers.js";


const router = Router();


//school admin
router.post("/login",studentLogin);

export default router