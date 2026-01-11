import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { deleteFromCloudinary, uploadToCloudnary } from "../utils/cloudinary.js";
import { emailVerificationEmail, sendMail } from "../utils/mail.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { User } from "../models/user.model.js";

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

export { registerUser };
