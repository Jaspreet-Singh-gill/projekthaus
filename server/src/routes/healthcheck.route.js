import { Router } from "express";
import healthChecker from "../controllers/healthcheck.controller.js"

// create a route for healthcheck api
const router = Router();

router.route("/").get(healthChecker);



export default router;