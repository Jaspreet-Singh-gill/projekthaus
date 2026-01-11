import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { error } from "console";
import fs from "fs";

dotenv.config();

//configuring the cloudinart

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.CLOUDNARY_APIKEY,
  api_secret: process.env.CLOUDNARY_APIPASSWORD,
});

const uploadToCloudnary = async function (
  filepath,
  foldername = "projecthaus/all",
) {
  try {
    if (!filepath) {
      throw "Filepath not found ";
    }
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
      folder: foldername,
      unique_filename: true,
    });

    fs.unlinkSync(filepath);
    return uploadResult;

  } catch (error) {
    fs.unlinkSync(filepath);
    console.log("An error has occured while uploading to the cloud ", error);
    return null;
  }
};

const deleteFromCloudinary = async function (public_id) {
  try {
    const deleteResult = await cloudinary.uploader.destroy(public_id);
    if (deleteResult.result == "ok")
      console.log("File deleted successFully from cloud");
    else console.log("Files result after deletion is ", deleteResult.result);
    return deleteResult;
  } catch (error) {
    console.log("There occured an error while deleting from cloudinary", error);
    return null;
  }
};

export{
    deleteFromCloudinary,
    uploadToCloudnary
}
