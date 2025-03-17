import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { Dashboard , createSchool , createSchoolAdmin, masterAdminLogin, allSchools, allSchoolsAdmin} from "../controllers/masterAdmin.controllers.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();
router.post("/master-admin-login",masterAdminLogin);
router.use(verifyJWT); 
router.get("/dashboard",isMasterAdmin,Dashboard);
router.post("/create-school", verifyJWT, isMasterAdmin ,upload.single("logo"), createSchool);
router.get("/allschools",isMasterAdmin,allSchools);
router.get("/allschoolsadmins",isMasterAdmin,allSchoolsAdmin);

//school admin
router.post("/schools/:schoolId/admin",isMasterAdmin,createSchoolAdmin);

export default router