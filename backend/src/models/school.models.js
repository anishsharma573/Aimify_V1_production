import mongoose from "mongoose"
const schoolSchema = new mongoose.Schema({
    name: String,
    address: String,
    logo: String,
    principalName: String,
    phoneNumber: String,
    createdBy: {
        _id: { type: mongoose.Schema.Types.ObjectId },
        username: String,
        email: String,
        role: String,
        // ... any other user fields you want to embed
      },
});


export const School = mongoose.model('School', schoolSchema, 'schools')