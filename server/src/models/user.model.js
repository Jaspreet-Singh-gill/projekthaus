import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const user = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phonenumber: {
      countryCode: {
        type: String,
      },
      number: {
        type: String,
        trim: true,
      },
    },
    age: {
      type: Number,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    address: {
      type: String,
    },
    organization: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    emailVerificationToken:{
      type:String
    },
    emailVerificationTokenExpiry:{
      type:String
    }
  },
  {
    timestamps: true,
  },
);

//pre hooks before save to hash the password if it is modiefied
user.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

//a method on user model to check the password
user.methods.isPasswordCorrect = async function (passwordText) {
  return await bcrypt.compare(passwordText, this.password);
};

user.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECREAT,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

user.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECREAT,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

user.methods.generateTempararyTokens = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000;

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", user);
