import {Router} from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/auth.controller.js";
import {registerLoginVerifcation} from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
const router = Router();





router.route("/register").post(upload.single('avatar'),registerLoginVerifcation(),validate,registerUser);




export default router;
