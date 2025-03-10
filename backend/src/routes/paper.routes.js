import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { setPaper } from "../controllers/paper.controllers.js";



const router = Router();

router.use(verifyJWT);
router.use(isMasterAdmin);

router.post("/set-paper", setPaper);




export default router