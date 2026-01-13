import {Router} from "express";
import { creatProject } from "../controllers/project.controller.js";
import verfiyJWT from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/create-project").post(verfiyJWT,creatProject);



export default router;