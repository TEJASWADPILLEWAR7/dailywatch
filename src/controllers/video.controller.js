import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/clouudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  app.get("/videos", async (req, res) => {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    // Pagination setup
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Building query
    let filter = {};
    if (query) {
      filter.title = { $regex: query, $options: "i" }; // Case-insensitive title search
    }
    if (userId) {
      filter.userId = userId;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    try {
      // Fetch videos with pagination, sorting, and filtering
      const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize);

      // Get total count for pagination meta
      const total = await Video.countDocuments(filter);

      res.json({
        success: true,
        data: videos,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
