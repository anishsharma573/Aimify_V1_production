import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Custom validation to ensure subdomain does not contain spaces
      validate: {

        validator: function(v) {
          return !/\s/.test(v);
        },
        message: props => `${props.value} should not contain spaces.`,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    principalName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      _id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      username: { 
        type: String, 
        required: true 
      },
    
      role: { 
        type: String, 
        required: true 
      },
    },
  },
  {
    timestamps: true,
  }
);

export const School = mongoose.model("School", schoolSchema);
