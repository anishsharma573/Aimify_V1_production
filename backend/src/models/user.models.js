import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date },
    password: { type: String, required: true },
 

    role: { 
        type: String, 
        enum: ['master_admin', 'school_admin', 'teacher', 'student'], 
        default: 'student' 
    },

    phone: { type: String, required: false },
    location: { type: String, required: false },
    class: { type: String, required: false },

    profile: {
        dob: { type: Date },
        email: { type: String, unique: true, sparse: true },
        alternatePhone: { type: String }
    },
    schoolId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "School"},
    parents: {
        mother: { 
            name: { type: String },
            occupation: { type: String }
        },
        father: { 
            name: { type: String },
            occupation: { type: String }
        }
    },

    goals: {
        initialGoal: [{ type: String }],
        strength: [{ type: String }],
        weakness: [{ type: String }]
    },

    academics: {
        favSubjects: [{ type: String }],
        weakSubjects: [{ type: String }]
    },

    skills: {
        lifeSkills: [{ type: String }],
        technicalSkills: [{ type: String }]
    },
    

    hobbies: [{ type: String }],

    idol: { type: String },
    refreshToken: {
        type: String
    }


}, {
    timestamps: true
});



UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in .env");
    }
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET || "defaultAccessTokenSecret", // Fallback
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m", // Fallback
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || "defaultRefreshTokenSecret", // Fallback
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d", // Fallback
        }
    );
};

export const User = mongoose.model('user', UserSchema, 'users');
