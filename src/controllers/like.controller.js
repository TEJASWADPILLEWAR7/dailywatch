import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  // Check if the user already liked the video
  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    // If the like exists, remove it
    await existingLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, "Like removed successfully"));
  } else {
    // If the like doesn't exist, create it
    const newLike = new Like({ video: videoId, likedBy: userId });
    await newLike.save();
    return res
      .status(201)
      .json(new ApiResponse(201, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID");

  const existingLike = await Like.findOne({
    commentId: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.remove();
  }
    const newLike = new Like({ commentId: commentId, likedBy: userId });
  
  await newLike.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");
    const existingLike = await Like.findOne({ tweetId: tweetId, likedBy: userId });
    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully"));
    } else {
        const newLike = new Like({ tweetId: tweetId, likedBy: userId });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
    .populate("video")
    .select("video -_id");

  if (!likedVideos.length) {
    return res.status(404).json(new ApiResponse(404, "No liked videos found"));
  }

  res.status(200).json(new ApiResponse(200, "Liked videos retrieved successfully", likedVideos));
});
const getLikedComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedcomment = await Like.find({ likedBy: userId, comment: { $exists: true } })
    .populate("comment")
    .select("comment -_id");

  if (!likedcomment.length) {
    return res.status(404).json(new ApiResponse(404, "No liked comment found"));
  }

  res.status(200).json(new ApiResponse(200, "Liked comment retrieved successfully", likedVideos));
});
const getLikedTweet = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedTweet = await Like.find({ likedBy: userId, tweet: { $exists: true } })
    .populate("tweet")
    .select("tweet -_id");

  if (!likedTweet.length) {
    return res.status(404).json(new ApiResponse(404, "No liked Tweet found"));
  }

  res.status(200).json(new ApiResponse(200, "Liked Tweet retrieved successfully", likedVideos));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos, getLikedComment, getLikedTweet };
