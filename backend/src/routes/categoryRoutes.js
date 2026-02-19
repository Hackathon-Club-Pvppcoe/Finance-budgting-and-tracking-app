import { Router } from "express";
import { body } from "express-validator";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.use(authGuard);

router.get("/", getCategories);
router.post("/", [body("name").trim().notEmpty().withMessage("Category name is required.")], createCategory);
router.put(
  "/:id",
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  updateCategory
);
router.delete("/:id", deleteCategory);

export default router;
