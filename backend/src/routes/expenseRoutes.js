import { Router } from "express";
import { body } from "express-validator";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expenseController.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.use(authGuard);

const expenseValidation = [
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0."),
  body("categoryId").isMongoId().withMessage("Valid category is required."),
  body("date").isISO8601().withMessage("Valid date is required."),
  body("note").optional().isLength({ max: 500 }).withMessage("Note is too long."),
];

router.get("/", getExpenses);
router.post("/", expenseValidation, createExpense);
router.put("/:id", expenseValidation, updateExpense);
router.delete("/:id", deleteExpense);

export default router;
