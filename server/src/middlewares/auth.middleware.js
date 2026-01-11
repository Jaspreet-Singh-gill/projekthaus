import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiErrorResponse.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, [], "unauthorized access");
  }
  try {
    const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECREAT);
    const user = await User.findById(data._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, [], "unauthorized access");
    }
    req.user = user;
    next();
  } catch (error) {
    throw error;
  }
});

export default verifyJWT;