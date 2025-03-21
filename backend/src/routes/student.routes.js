import Router from "express";
import isMasterAdmin from "../middleware/masterAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { studentLogin ,getStudentsByClassAndSubdomain  ,updateStudentProfile} from "../controllers/students.controllers.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();


//school admin
router.post("/login",studentLogin);
router.use(verifyJWT);
router.get('/', getStudentsByClassAndSubdomain );
router.put("/update-profile/:userId", upload.single("logo"), updateStudentProfile); 
export default router