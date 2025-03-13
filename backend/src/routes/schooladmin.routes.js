import Router from "express";
import multer from "multer";
import isSchoolAdmin from "../middleware/schoolAdmin.middlewares.js";
import { verifyJWT } from "../middleware/auth.middlwares.js";
import { schoolAdminLogin , addStudent, addTeacher, showStudents, showTeacher} from "../controllers/schoolAdmin.controllers.js";
const upload = multer({ dest: "uploads/" });

const  router = Router();
// const upload = multer({ dest: "uploads/" });
// // router.post("/school-admin-login",schoolAdminLogin);
// router.use(verifyJWT);
// router.use(isSchoolAdmin);
// router.post("/schools/:schoolId/add-users", upload.single("file"), addStudent);
router.post('/login', schoolAdminLogin);
router.post('/schools/:schoolId/add-student',verifyJWT,isSchoolAdmin, addStudent);
router.post('/schools/:schoolId/add-teacher',verifyJWT,isSchoolAdmin, addTeacher);
router.get('/schools/:schoolId/students',verifyJWT,isSchoolAdmin, showStudents);
router.get('/schools/:schoolId/teacher',verifyJWT,isSchoolAdmin, upload.single("file"), showTeacher);

export default router