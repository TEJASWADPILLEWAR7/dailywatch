import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  // Check if a subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed from channel"));
  }

  // Subscribe
  const newSubscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  return res.status(201).json({
    message: "Subscribed successfully",
    subscription: newSubscription,
  });
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Find all subscriptions where the 'channel' matches the provided channelId
  const subscribers = await Subscription.find({ channel: channelId }).select(
    "subscriber createdAt"
  );
  if (!subscribers || subscribers.length === 0)
    throw new ApiError(404, "no subsciber found");

  // Return the list of subscribers
  res.status(200).json(new ApiResponse(200, subscribers, " Subscriber found"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscribed = await Subscription.find({
    subscriber: subscriberId,
  }).select("subscriber createdAt");

  if (!subscribed || subscribed.length === 0)
    throw new ApiError(404, "Not subscibed any channel");

  return res
    .status(200)
    .json(new ApiResponse(200, subscribed, "Subscribed Channel"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
