import mongoose from "mongoose";
import { refreshModel } from "@/utils/refreshModel";

const offenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offenceDetails: {
      type: String,
      required: true,
    },
    offenceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Offence = refreshModel("Offence", offenceSchema);

export default Offence;
