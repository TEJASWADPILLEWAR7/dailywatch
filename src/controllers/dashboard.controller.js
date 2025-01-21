import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalViews = await Video.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalLikes = await Like.countDocuments({ channel: channelId });
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const stats = {
    totalVideos,
    totalViews: totalViews[0]?.totalViews || 0,
    totalLikes,
    totalSubscribers,
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats retrieved successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelId = req.params.channelId;
  if (channelId) throw new ApiError(404, "Channel not found");
  const videos = await Video.find({ channelId: channelId }).populate(
    "channelId"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
