import {ApiError} from "../utils/apiErrorResponse.js";
import { validationResult } from "express-validator";

const validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {
    const returnErrors = [];

    errors.array().forEach((err) => {
      returnErrors.push({ [err.path]: err.msg });
    });

    res
      .status(400)
      .json(new ApiError(400, errors, "Invalid data sent to the server"));
  }
};

export { validate };
