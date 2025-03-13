import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { assignPaper } from "../controllers/paper.controllers.js";


const router = Router();

router.use(verifyJWT);
router.use(isMasterAdmin);

router.post("/create/exam", assignPaper);




export default router