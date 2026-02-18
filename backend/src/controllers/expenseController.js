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

const findAllowedCategory = (userId, categoryId) =>
  Category.findOne({
    _id: categoryId,
    $or: [{ isDefault: true }, { userId }],
  });

export const getExpenses = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      query.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(query)
      .populate("categoryId", "name isDefault")
      .sort({ date: -1, createdAt: -1 });

    return res.json({ expenses });
  } catch (error) {
    return next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    if (validationError(req, res)) return;

    const { amount, categoryId, date, note } = req.body;
    const category = await findAllowedCategory(req.user._id, categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category." });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      categoryId,
      date,
      note: note || "",
    });

    const populated = await expense.populate("categoryId", "name isDefault");
    return res.status(201).json({ expense: populated });
  } catch (error) {
    return next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    if (validationError(req, res)) return;

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    const { amount, categoryId, date, note } = req.body;
    const category = await findAllowedCategory(req.user._id, categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category." });
    }

    expense.amount = amount;
    expense.categoryId = categoryId;
    expense.date = date;
    expense.note = note || "";
    await expense.save();

    const populated = await expense.populate("categoryId", "name isDefault");
    return res.json({ expense: populated });
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }
    await expense.deleteOne();
    return res.json({ message: "Expense deleted." });
  } catch (error) {
    return next(error);
  }
};
