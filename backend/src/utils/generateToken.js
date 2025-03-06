import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        console.log("Generating tokens for User ID:", userId);

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found for ID:", userId);
            throw new ApiError(404, "User not found");
        }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("Access Token Generated:", accessToken);
        console.log("Refresh Token Generated:", refreshToken);

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateRefreshAndRefreshToken:", error.message);
        throw new ApiError(
            500,
            "Something went wrong while generating the access token and refresh token"
        );
    }
};

export { generateAccessAndRefreshToken };