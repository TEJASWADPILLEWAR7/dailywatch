import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/clouudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
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

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const publishVideo = await uploadOnCloudinary(videoLocalPath);
  const publishThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  try {
    const video = new Video({
      title,
      description,
      duration: publishVideo.duration,
      videoFile: publishVideo.secure_url,
      thumbnail: publishThumbnail.secure_url,
    });
    await video.save();

    return res
      .status(201)
      .json(new ApiResponse(200, video, "Video created successfully"));
  } catch (error) {
    console.log("Video upload failed");
    if (publishVideo) {
      await deleteFromCloudinary(publishVideo.public_id);
    }
    if (publishThumbnail) {
      await deleteFromCloudinary(publishThumbnail.public_id);
    }
    return res.status(500).json(new ApiError(500, null, "Video upload failed"));
  }
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
