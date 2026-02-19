import { validationResult } from "express-validator";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";

const validationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return true;
  }
  return false;
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId: req.user._id }],
    }).sort({ isDefault: -1, name: 1 });

    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    if (validationError(req, res)) return;

    const normalizedName = req.body.name.trim();
    const existing = await Category.findOne({
      $or: [{ isDefault: true }, { userId: req.user._id }],
      name: { $regex: `^${normalizedName}$`, $options: "i" },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const category = await Category.create({
      name: normalizedName,
      userId: req.user._id,
      isDefault: false,
      monthlyBudget: req.body.monthlyBudget || 0,
    });

    return res.status(201).json({ category });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (validationError(req, res)) return;

    const category = await Category.findById(req.params.id);
    if (!category || category.isDefault || String(category.userId) !== String(req.user._id)) {
      return res.status(404).json({ message: "Custom category not found." });
    }

    const normalizedName = req.body.name.trim();
    const conflict = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ isDefault: true }, { userId: req.user._id }],
      name: { $regex: `^${normalizedName}$`, $options: "i" },
    });

    if (conflict) {
      return res.status(400).json({ message: "Category name already used." });
    }

    category.name = normalizedName;
    if (req.body.monthlyBudget !== undefined) {
      category.monthlyBudget = req.body.monthlyBudget;
    }
    await category.save();
    return res.json({ category });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: "Default categories cannot be deleted." });
    }

    if (String(category.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const linkedExpenses = await Expense.countDocuments({
      userId: req.user._id,
      categoryId: category._id,
    });
    if (linkedExpenses > 0) {
      return res.status(400).json({
        message: "Cannot delete category with linked expenses. Update those expenses first.",
      });
    }

    await category.deleteOne();
    return res.json({ message: "Category deleted." });
  } catch (error) {
    return next(error);
  }
};
