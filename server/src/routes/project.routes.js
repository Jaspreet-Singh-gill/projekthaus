import {Router} from "express";
import { creatProject,updateProject } from "../controllers/project.controller.js";
import verfiyJWT from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/project.middleware.js";


const router = Router();


router.route("/create-project").post(verfiyJWT,creatProject);
router.route("/:projectId/update-project").put(verfiyJWT,verifyAdmin,updateProject);

export default router;