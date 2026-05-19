import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

router.get(
	"/authors",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.listAuthors(req, res),
);

router.post(
	"/admins",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.createAdmin(req, res),
);

router.delete(
	"/admins/:id",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.deleteAdmin(req, res),
);

router.post(
	"/",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.createAuthor(req, res),
);

router.patch(
	"/:id/role",
	authMiddleware,
	requireRole("ADMIN"),
	(req, res) => controller.changeRole(req, res),
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
