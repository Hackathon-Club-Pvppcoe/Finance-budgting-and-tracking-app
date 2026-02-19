import Expense from "../models/Expense.js";

const monthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

export const getMonthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const byCategory = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          name: "$category.name",
          total: { $round: ["$total", 2] },
          budget: "$category.monthlyBudget",
        },
      },
      { $sort: { total: -1 } },
    ]);

    const total = byCategory.reduce((sum, item) => sum + item.total, 0);
    const highestCategory = byCategory[0] || null;

    const trendStart = new Date(year, month - 6, 1);
    const trendDataRaw = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: trendStart, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const trendMap = new Map(
      trendDataRaw.map((row) => [`${row._id.year}-${row._id.month}`, Number(row.total.toFixed(2))])
    );

    const trend = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(year, month - 1 - offset, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trend.push({
        label: monthLabel(d.getFullYear(), d.getMonth() + 1),
        total: trendMap.get(key) || 0,
      });
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    return res.json({
      summary: {
        month,
        year,
        total: Number(total.toFixed(2)),
        expenseCount,
        highestCategory,
        byCategory,
        trend,
      },
    });
  } catch (error) {
    return next(error);
  }
};
