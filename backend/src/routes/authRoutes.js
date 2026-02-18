import { Router } from "express";
import { body } from "express-validator";
import { getMe, login, register } from "../controllers/authController.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  login
);

router.get("/me", authGuard, getMe);

export default router;
