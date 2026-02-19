import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { getMonthlySummary } from "../controllers/reportController.js";

const router = Router();

router.use(authGuard);
router.get("/monthly", getMonthlySummary);

export default router;
