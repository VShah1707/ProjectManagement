import { User } from "../models/users.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getId = (val) => {
  return new mongoose.Types.ObjectId(val);
};

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: getId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectMembers",
              localField: "_id",
              foreignField: "project",
              as: "projectsmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectsmembers",
              },
            },
          },
        ],
      },
    },
    { $unwind: "$project" },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: getId(req.user._id),
  });

  await ProjectMember.create({
    user: getId(req.user._id),
    project: getId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  // test
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true },
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project details updated successfully"),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  // test
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  res.status(200).json(200, project, "Project deleted successfully");
});

const addMembersToProject = asyncHandler(async (req, res) => {
  // test
  const { email, role } = req.body;
  const { projectId } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  await ProjectMember.findOneAndUpdate(
    {
      user: getId(user._id),
      project: getId(projectId),
    },
    {
      user: getId(user._id),
      project: getId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  );

  return res.status(200).json(201, {}, "Project member added successfully");
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // test
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = ProjectMember.aggregate([
    {
      $match: {
        project: getId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "members",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project members fetched successfully",
      ),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  // test
  const { projectId, userId } = req.params;
  const { newRole } = req.body;
  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid Role");
  }

  const projectMember = await ProjectMember.findOne({
    project: getId(projectId),
    user: getId(userId),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not found");
  }

  const updatedProjectMember = await ProjectMember.findByIdAndDelete(
    projectMember._id,
    { role: newRole },
    { new: true },
  );

  res
    .status(200)
    .json(200, updateProject, "Project member role updated successfully");
});

const deleteMember = asyncHandler(async (req, res) => {
  // test
  const { userId, projectId } = req.params;
  let projectMember = await ProjectMember.fincOne({
    user: getId(userId),
    projecy: getId([projectId]),
  });

  if (!projectMember) {
    throw new ApiError(400, "Project Member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  res
    .status(200)
    .json(200, projectMember, "Project member deleted successfully");
});

export {
  addMembersToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  updateProject,
  getProjects,
  updateMemberRole,
};
