import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    monthlyBudget: {
      type: Number,
      default: 1000,
      min: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
