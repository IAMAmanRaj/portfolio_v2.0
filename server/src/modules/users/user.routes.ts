import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

router.post(
	"/",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.createAuthor(req, res),
);

router.patch(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.updateAuthor(req, res),
);

router.delete(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.deleteAuthor(req, res),
);

export const userRoutes = router;

