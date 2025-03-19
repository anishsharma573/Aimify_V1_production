import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { School } from "../models/school.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token and refresh token"
        );
    }
};

const Dashboard = asyncHandler(async (req, res, next) => {
    const [totalSchool, totalAdmins] = await Promise.all([
        School.countDocuments(),
        User.countDocuments({ role: "school_admin" }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { totalSchool, totalAdmins })
    );
});

const masterAdminLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ username });

    if (!user) {
        throw new ApiError(400, "User not found, please register before login");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Username and password do not match");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if (!loggedInUser) {
        throw new ApiError(400, "Logged in user is not there");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken }
        ));
});

const createSchool = asyncHandler(async (req, res, next) => {
    const { name, address, principalName, phoneNumber, subdomain } = req.body;

    let logoUrl = req.body.logo;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        if (!result) {
            throw new ApiError(500, "Error uploading logo to Cloudinary");
        }
        logoUrl = result.secure_url;
    }

    const school = await School.create({
        name,
        address,
        logo: logoUrl,
        principalName,
        phoneNumber,
        subdomain,
        createdBy: {
            _id: req.user._id,
            username: req.user.username,
            role: req.user.role,
        },
    });

    await school.save();

    return res.status(200).json(
        new ApiResponse(200, {
            message: "School created successfully",
            data: school,
        })
    );
});

const createSchoolAdmin = asyncHandler(async (req, res, next) => {
    const { schoolId } = req.params;
    const { name, username, phone, password } = req.body;

    const school = await School.findById(schoolId);
    if (!school) {
        throw new ApiError(400, "School not found");
    }

    if (!name || !username || !phone || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const newAdmin = await User.create({
        name,
        username,
        phone,
        password,
        role: "school_admin",
        schoolId: school._id,
        createdBy: {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        },
    });

    return res.status(200).json(new ApiResponse(200, {
        data: newAdmin,
        message: "School admin created successfully"
    }));
});

const allSchools = asyncHandler(async (req, res, next) => {
    const schools = await School.find({}).lean();
    return res
        .status(200)
        .json(new ApiResponse(200, { schools }, "Schools fetched successfully"));
});

const allSchoolsAdmin = asyncHandler(async (req, res, next) => {
    const schoolAdmins = await User.find({ role: "school_admin" }).lean();
    return res
        .status(200)
        .json(new ApiResponse(200, { schoolAdmins }, "School admins fetched successfully"));
});

export {
    Dashboard,
    createSchool,
    allSchoolsAdmin,
    masterAdminLogin,
    allSchools,
    createSchoolAdmin
};
