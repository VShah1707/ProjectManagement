import { User } from "../models/users.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtasks.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getId = (val) => {
  return new mongoose.Types.ObjectId(val);
};

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: getId(projectId),
  }).populate("assignedTo", "avatar email fullName username");

  res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTasks = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const files = req.files || [];
  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo ? getId(assignedTo) : undefined,
    status,
    attachment: attachments,
    project: getId(projectId),
    assignedBy: getId(req.user._id),
  });

  res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskbyId = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const tasks = await Task.aggregate([
    {
      $match: {
        _id: getId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedto",
        pipeline: [
          {
            $project: { _id: 1, username: 1, email: 1, fullName: 1, avatar: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtask",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
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
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedto: {
          $arrayElemAt: ["$assignedto", 0],
        },
      },
    },
  ]);

  if (!tasks || !tasks.length) {
    throw new ApiError(402, "Task not found")
  }

  res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
});

const updateTask = asyncHandler(async (req, res) => {
  // test
});

const deleteTask = asyncHandler(async (req, res) => {
  // test
});
const createSubTask = asyncHandler(async (req, res) => {
  // test
});

const updateSubTask = asyncHandler(async (req, res) => {
  // test
});

const deleteSubTask = asyncHandler(async (req, res) => {
  // test
});

export {
  getTaskbyId,
  getTasks,
  createSubTask,
  createSubTask,
  updateSubTask,
  updateTask,
  deleteSubTask,
  deleteTask,
};
