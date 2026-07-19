import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { PostController } from "./post.controller";

const router = Router();
const controller = new PostController();

// Any authenticated role (AUTHOR, ADMIN, SUPER_ADMIN) can manage their own posts.
const anyAuthenticatedRole = requireRole("AUTHOR", "ADMIN", "SUPER_ADMIN");

// NOTE: "/manage*" routes are registered before "/:slug" so the literal
// segment "manage" is never swallowed by the :slug wildcard below.

router.get(
	"/manage",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.listForManage(req, res),
);

router.get(
	"/manage/:id",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.getForManage(req, res),
);

router.post(
	"/",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.create(req, res),
);

router.patch(
	"/manage/:id",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.update(req, res),
);

router.delete(
	"/manage/:id",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.remove(req, res),
);

// Public reads — published posts only.
router.get("/:slug", (req, res) => controller.getPublishedBySlug(req, res));
router.get("/", (req, res) => controller.listPublished(req, res));

export const postRoutes = router;
