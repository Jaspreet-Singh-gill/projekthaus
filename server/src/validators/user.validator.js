import { body } from "express-validator";

const registerLoginVerifcation = function () {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .toLowerCase()
      .isEmail()
      .withMessage("Email is not valid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .toLowerCase()
      .isLength({ min: 4 })
      .withMessage("username must be atleast 4 character long"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required to register")
      .isLength({ min: 8 })
      .withMessage("username must be atleast 4 character long"),
    body("name")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("name is required"),
    body("gender")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("gender is required"),
    body("phoneNUmber").trim().optional(),
    body("address").trim().toLowerCase().optional(),
    body("organisation").trim().toLowerCase().optional(),
    body("age").optional(),
  ];
};

const loginVerification = function () {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .toLowerCase()
      .isEmail()
      .withMessage("Email is not valid"),
    ,
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required to register")
      .isLength({ min: 8 })
      .withMessage("password must be atleast 8 character long"),
  ];
};

const updateInfo = function () {
  return [
    body("name")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("name is required"),
    body("gender")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("gender is required"),
    body("phonenumber").trim().optional(),
    body("address").trim().toLowerCase().optional(),
    body("organization").trim().toLowerCase().optional(),
    body("age").optional(),
  ];
};

const changePasswordValidator = function () {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("old password is required to register"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage(" new password is required to register")
      .isLength({ min: 8 })
      .withMessage("new password must be atleast 8 character long"),
  ];
};


export { registerLoginVerifcation, loginVerification, updateInfo,changePasswordValidator };
