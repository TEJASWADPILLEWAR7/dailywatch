import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {
    page = 1,
    limit = 10,
    query,
    userId,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  // Validate pagination inputs
  const pageNumber = Math.max(1, parseInt(page, 10));
  const pageSize = Math.max(1, parseInt(limit, 10));
  const skip = (pageNumber - 1) * pageSize;

  // Build filter object
  let filter = { videoId }; // Mandatory filter
  if (query) {
    filter.commentText = { $regex: query, $options: "i" }; // Assuming "commentText" is a field
  }
  if (userId) {
    filter.userId = userId;
  }

  // Sorting options
  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

  try {
    // Fetch comments
    const comments = await Comment.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // Get total count for pagination
    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: comments,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments.",
      error: error.message,
    });
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
