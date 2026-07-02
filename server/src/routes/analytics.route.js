import { Router } from "express";
import { getGlobalAnalytics, getProjectAnalytics } from "../controllers/analytics.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { memberOfProject } from "../middlewares/project.middleware.js";

const router = Router();

router.route("/global").get(verifyJWT, getGlobalAnalytics);
router.route("/project/:projectId").get(verifyJWT, memberOfProject, getProjectAnalytics);

export default router;
