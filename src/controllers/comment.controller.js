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
  const { videoId, content, parentId } = req.body;

  // Validation
  if (!videoId || !content) {
    res.status(400);
    throw new Error("Video ID and content are required.");
  }

  try {
    // Create a new comment object
    const newComment = await Comment.create({
      videoId,
      content,
      userId: req.user.id, // Assuming `req.user` contains authenticated user info
      parentId: parentId || null, // Optional parent comment for replies
    });

    // Send the newly created comment as a response
    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: newComment,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to add comment. Please try again.");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validation
  if (!content) {
    res.status(400);
    throw new Error("Content is required to update the comment.");
  }

  try {
    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404);
      throw new Error("Comment not found.");
    }

    // Ensure the user is the author of the comment
    if (comment.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error("You are not authorized to update this comment.");
    }

    // Update the comment content
    comment.content = content;
    const updatedComment = await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to update comment. Please try again.");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  try {
    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404);
      throw new Error("Comment not found.");
    }

    // Ensure the user is the author of the comment
    if (comment.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error("You are not authorized to delete this comment.");
    }

    // Delete the comment
    await comment.remove();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to delete comment. Please try again.");
  }
});
export { getVideoComments, addComment, updateComment, deleteComment };
