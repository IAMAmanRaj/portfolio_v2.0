import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

// Any authenticated role can manage their own profile — this is
// self-presentation (displayName/bio/avatarUrl), not account administration.
const anyAuthenticatedRole = requireRole("AUTHOR", "ADMIN", "SUPER_ADMIN");

// Must be registered before "/:id" below, or Express will match "me" as
// an :id param on the ADMIN-only route instead.
router.patch(
	"/me",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.updateProfile(req, res),
);

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
	requireRole("SUPER_ADMIN"),
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
