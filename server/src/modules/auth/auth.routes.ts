import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { AuthController } from "./auth.controller";

const router = Router();
const controller = new AuthController();

const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/login", authRateLimiter, (req, res) => controller.login(req, res));
router.post("/logout", (req, res) => controller.logout(req, res));
router.get("/me", authMiddleware, (req, res) => controller.me(req, res));

export const authRoutes = router;

