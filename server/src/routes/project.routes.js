import { Router } from "express";
import {
  creatProject,
  getTheProject,
  updateProject,
  listAllTheProject,
  addMember,
  userInaddMember,
  userNotInaddMember,
  htmlForm,
  getTheMembers,
  removeTheMember,
  changeRoles,
} from "../controllers/project.controller.js";
import { registerUser } from "../controllers/auth.controller.js";
import verfiyJWT from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/project.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerLoginVerifcation } from "../validators/user.validator.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create-project").post(verfiyJWT, creatProject);

//secure routes
router
  .route("/:projectId/update-project")
  .put(verfiyJWT, verifyAdmin, updateProject);
router.route("/:projectId/get-the-project").get(verfiyJWT, getTheProject);
router.route("/listAll").get(verfiyJWT, listAllTheProject);

//member routes
router.route("/:projectId/:email/htmlForm").get(htmlForm);
router.route("/:projectId/join-the-project/:token/").get(userInaddMember);
router
  .route("/:projectId/join-project")
  .post(
    upload.single("avatar"),
    registerLoginVerifcation(),
    validate,
    userNotInaddMember,
  );
router.route("/:projectId/peoples").get(verfiyJWT,getTheMembers);
router.route("/:projectId/remove-member").delete(verfiyJWT,verifyAdmin,removeTheMember);
router.route("/:projectId/changeroles").post(verfiyJWT, verifyAdmin,changeRoles);

router.route("/:projectId/add-member").post(verfiyJWT, verifyAdmin, addMember);
export default router;
