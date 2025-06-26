import mongoose from "mongoose";
import { refreshModel } from "@/utils/refreshModel";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  image: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const User = refreshModel("User", userSchema);

export default User;
