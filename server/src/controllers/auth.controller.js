import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { deleteFromCloudinary, uploadToCloudnary } from "../utils/cloudinary.js";
import { emailVerificationEmail, sendMail } from "../utils/mail.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

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
  const filePath = req.file?.path;
  const response = await uploadToCloudnary(filePath);
  if (!response) {
    throw new ApiError(400, [], "Upload of avatar to cloud failed");
  }
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
      url: response.url,
      publicId: response.public_id,
    },
  };

  try{
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

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User is registered and email is send for verification",
      ),
    );

  }catch(error){
    deleteFromCloudinary(response.public_id);
    throw error;
    
  };
});


const verifyEmailAdress = asyncHandler(async (req,res,next)=>{
  const unHashedToken = req.params.token;
  if(!unHashedToken)
  {
    throw new ApiError(400,[],"Token is not pressent in the url");
  }
  const hashedToken = crypto.createHash("sha256")
                            .update(unHashedToken)
                            .digest("hex");

  const user = await User.findOne({
    emailVerificationToken:hashedToken,
    emailVerificationTokenExpiry: {$gt :Date.now()}

  });

  if(!user){
    throw new ApiError(401,[],"The token is expired or invalid");
  }

  user.isEmailVerified = true;
  user.save({validateBeforeSave:false});

  res.status(200).json(new ApiResponse(200,{verified :user.isEmailVerified},"the mail is verified successfully"))
});

export { registerUser,verifyEmailAdress};
