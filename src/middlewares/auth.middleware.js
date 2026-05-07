import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedTooken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedTooken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new Error(401, "invalid access token");
  }
});

export const validateProjectPermission = (roles = []) => {
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(400, "Project Id is missing");
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "Project not found");
    }

    const givenRole = project?.role;
    req.user.role = givenRole;
    if(!roles.includes(givenRole)) {
      throw new ApiError(400, "Project not found");
    }
    next()
  });
};
