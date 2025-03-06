import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const isMasterAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json(new ApiResponse(401, "Authentication required"));
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }
  if (user.role !== "master_admin") {
    return res.status(401).json(new ApiResponse(401, "You are not authorized to perform this action"));
  }
  next();
});

export default isMasterAdmin;
