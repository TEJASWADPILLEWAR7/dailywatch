import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const asyncHandler = require("express-async-handler");
const Subscription = require("../models/Subscription"); // Adjust the path as needed

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // The channel the user wants to subscribe/unsubscribe to
  const userId = req.user._id; // Assuming authenticated user's ID is available in req.user

  // Check if a subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe (delete the existing subscription)
    await existingSubscription.deleteOne();
    return res.status(200).json({ message: "Unsubscribed successfully" });
  }

  // Subscribe (create a new subscription)
  const newSubscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  return res.status(201).json({
    message: "Subscribed successfully",
    subscription: newSubscription,
  });
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
