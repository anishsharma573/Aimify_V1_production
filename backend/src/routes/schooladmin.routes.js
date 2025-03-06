import Router from "express";
import multer from "multer";
import isSchoolAdmin from "../middleware/schoolAdmin.middlewares.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { schoolAdminLogin , addStudent} from "../controllers/schoolAdmin.controllers.js";
const  router = Router();
// const upload = multer({ dest: "uploads/" });
// // router.post("/school-admin-login",schoolAdminLogin);
// router.use(verifyJWT);
// router.use(isSchoolAdmin);
// router.post("/schools/:schoolId/add-users", upload.single("file"), addStudent);
router.post('/login', schoolAdminLogin);
router.post('/schools/:schoolId/add-users',verifyJWT,isSchoolAdmin, addStudent);

export default router