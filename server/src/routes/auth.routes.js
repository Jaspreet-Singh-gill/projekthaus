import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  verifyEmailAdress,
  loginUser,
  refreshTokens,
  resendEmailVerification,
} from "../controllers/auth.controller.js";
import {
  registerLoginVerifcation,
  loginVerification,
} from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
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
router.route("/login").post(loginVerification(), validate, loginUser);

//secure routes
router.route("/refreshTokens").get(refreshTokens);
router
  .route("/resendEmailVerification")
  .get(verifyJWT, resendEmailVerification);

export default router;
