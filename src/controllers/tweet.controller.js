import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const content = req.body;
  const userId = req.user._id;

  if (!content) throw new ApiError(400, "Tweet content is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const tweets = await Tweet.find({ owner: userId }).populate("owner");
  if (!tweets.length) {
    throw new ApiError(404, "No tweets found for this user.");
  }
  return res
    .status(200)
    .json(new ApiResponse(tweets, "User tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const content = req.body;
  const tweetId = req.params;
  const userId = req.user._id;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");
  const user = await User.findById(userId);
  if (!userId) throw new ApiError(404, "User not found");

  if (!tweet.owner.equals(userId))
    throw new ApiError(403, "You are not the owner of this tweet");

  tweet.content = content || tweet.content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully.", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const tweetId = req.params;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");

  if (!tweet.owner.equals(req.user._id))
    throw new ApiError(403, "You are not the owner of this tweet");

  await tweet.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
