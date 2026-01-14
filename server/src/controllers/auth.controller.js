import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import {
  deleteFromCloudinary,
  uploadToCloudnary,
} from "../utils/cloudinary.js";
import {
  emailVerificationEmail,
  sendMail,
  resetPasswordEmail,
} from "../utils/mail.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validate } from "../middlewares/validate.middleware.js";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error, "something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const {
    username,
    email,
    password,
    name,
    age,
    gender,
    organization,
    phoneNumber,
  } = req.body;
  const duplicateUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (duplicateUser) {
    throw new ApiError(
      409,
      [],
      "User with this username or email already exists",
    );
  }

  let response = undefined;
  const filePath = req.file?.path;
  if (filePath) response = await uploadToCloudnary(filePath);
  //console.log(response.public_id);
  const object = {
    username,
    email,
    password,
    name,
    age,
    gender,
    organization,
    phoneNumber,
    avatar: {
      url: response?.url,
      publicId: response?.public_id,
    },
  };

  try {
    const user = await User.create(object);
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTempararyTokens();

    const emailToSend = {
      email,
      subject: "Verify your email",
      mailContent: emailVerificationEmail(
        `${process.env.emailVerificationAddress}/${unHashedToken}`,
      ),
    };

    await sendMail(emailToSend);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select(
      "-password -emailVerificationToken -emailVerificationTokenExpiry",
    );
    if (!createdUser) {
      throw new ApiError(401, [], "your registeration failed");
    }

    req.user = createdUser;

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdUser,
          "User is registered and email is send for verification",
        ),
      );
  } catch (error) {
    deleteFromCloudinary(response.public_id);
    throw error;
  }
});

const verifyEmailAdress = asyncHandler(async (req, res, next) => {
  const unHashedToken = req.params.token;
  if (!unHashedToken) {
    throw new ApiError(400, [], "Token is not pressent in the url");
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(401, [], "The token is expired or invalid");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { verified: user.isEmailVerified },
        "the mail is verified successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(404, [], "invalid credentials");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(404, [], "invalid credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  let sendUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  let options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, sendUser, "login is successfull"));
});

const refreshTokens = asyncHandler(async (req, res, next) => {
  const tokenExtraceted =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!tokenExtraceted) {
    throw new ApiError(401, [], "token not found");
  }

  try {
    const decodedInfo = jwt.verify(
      tokenExtraceted,
      process.env.REFRESH_TOKEN_SECREAT,
    );

    const user = await User.findById(decodedInfo._id);
    if (!user) {
      throw new ApiError(401, [], "Unauthorized accesss");
    }
    if (user.refreshToken != tokenExtraceted) {
      throw new ApiError(401, [], "invalid token or token expired");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    let options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, [], "refresh and token updated"));
  } catch (error) {
    throw error;
  }
});

const resendEmailVerification = asyncHandler(async (req, res, next) => {
  //checking user is already thier email or not
  if (req.user.isEmailVerified) {
    throw new ApiError(400, [], "Your email is alreay verified");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(402, [], "unautherized access to the server");
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTempararyTokens();

  try {
    const emailToSend = {
      email: user.email,
      subject: "Verify your email",
      mailContent: emailVerificationEmail(
        `${process.env.emailVerificationAddress}/${unHashedToken}`,
      ),
    };

    await sendMail(emailToSend);
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });
    return res
      .status(201)
      .json(new ApiResponse(201, [], "email is send for verification"));
  } catch (error) {
    throw new ApiError(500, error, "Something went wrong try again");
  }
});

const logOut = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );
  //already verified by the middleware

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "", "logout is successfull"));
});

const changeAvatar = asyncHandler(async (req, res, next) => {
  //get the image path on server
  const filePath = req.file?.path;
  const response = await uploadToCloudnary(filePath);
  if (!response) {
    throw new ApiError(400, [], "Upload of avatar to cloud failed");
  }

  try {
    if (req.user.avatar)
      await deleteFromCloudinary(req.user.avatar.publicId);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: {
            url: response.url,
            publicId: response.public_id,
          },
        },
      },
      {
        new: true,
      },
    );

    res
      .status(200)
      .json(new ApiResponse(200, "", "The avatar is change successFulyy"));
  } catch (error) {
    deleteFromCloudinary(response.public_id);
    throw error;
  }
});

const updateUserProfile = asyncHandler(async (req, res, next) => {
  //frontend is made such that even if user change one thing
  //it will send all the data field wheater the information is change or not to make things simple
  const { username, name, gender, phonenumber, organization, address, age } =
    req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        gender,
        phonenumber,
        organization,
        address,
        age,
      },
    },
    {
      new: true,
    },
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );

  res
    .status(202)
    .json(new ApiResponse(202, user, "The profile information is updated"));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(500, [], "Somthing went wrong");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, [], "password is invalid");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(201)
    .json(new ApiResponse(201, [], "password is changed successfully"));
});

const forgetPassword = asyncHandler(async (req, res, next) => {
  const { username, email } = req.body;
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, [], "Email or username does not exits");
  }
  try {
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTempararyTokens();
    const emailToSend = {
      email: user.email,
      subject: "Verify your email",
      mailContent: resetPasswordEmail(
        `${process.env.forgetpassword}/${unHashedToken}`,
      ),
    };
    await sendMail(emailToSend);
    user.forgetPasswordToken = hashedToken;
    user.forgetPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "",
          "password reset link has been sent to your email",
        ),
      );
  } catch (error) {
    throw new ApiError(500, error, "something went wrong");
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    throw new ApiError(400, "", "password is required");
  }
  const { token } = req.params;

  if (!token) {
    throw new ApiError(402, "", "unautherized access to this route");
  }
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      forgetPasswordToken: hashedToken,
      forgetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw new ApiError(401, "", "email link is invalid or expired");
    }
    user.password = newPassword;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, "", "reset of the email is successfull"));
  } catch (error) {
    throw error;
  }
});

export {
  registerUser,
  verifyEmailAdress,
  loginUser,
  refreshTokens,
  resendEmailVerification,
  logOut,
  changeAvatar,
  updateUserProfile,
  changePassword,
  forgetPassword,
  resetPassword,
};
