import mongoose from "mongoose";
import { refreshModel } from "@/utils/refreshModel";

const fingerprintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageSize: {
    type: Number,
  },
  imageName: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Fingerprint = refreshModel("Fingerprint", fingerprintSchema);

export default Fingerprint;
