import { School } from "../models/school.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

 const getSchoolBySubdomain = asyncHandler(async (req, res, next) => {
  // Extract the subdomain from the request body or fallback to the host header.
  const clientSubdomain = req.headers.host;
 
console.log("Host:", req.headers.host);

  
  const subdomain = clientSubdomain ;

  console.log("Extracted subdomain:", subdomain);

  // Find the school based on the subdomain.
  const school = await School.findOne({ subdomain });
  if (!school) {
    throw new ApiError(404, "School not found for the provided subdomain");
  }

  // Return the school with all its fields (e.g., logo, name, address, etc.)
  return res.status(200).json(
    new ApiResponse(200, school, "School found successfully.")
  );
});

export { getSchoolBySubdomain };