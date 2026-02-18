import mongoose from "mongoose";
import { DEFAULT_CATEGORIES } from "../utils/defaultCategories.js";
import Category from "../models/Category.js";

export const connectDB = async (mongoUri) => {
  await mongoose.connect(mongoUri);

  const existingDefaults = await Category.countDocuments({ isDefault: true });
  if (existingDefaults === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name) => ({
        name,
        isDefault: true,
        userId: null,
      }))
    );
  }
};
