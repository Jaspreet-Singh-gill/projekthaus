import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  verifyEmailAdress,
} from "../controllers/auth.controller.js";
import { registerLoginVerifcation } from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
const router = Router();

router
  .route("/register")
  .post(
    upload.single("avatar"),
    registerLoginVerifcation(),
    validate,
    registerUser,
  );

router.route("/verify-email-address/:token/").get(verifyEmailAdress);

export default router;
