import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { TagController } from "./tag.controller";

const router = Router();
const controller = new TagController();

// Deliberately looser than categories. Tags are content-level labels applied
// while writing, so an author shouldn't need an admin to add one.
const anyAuthenticatedRole = requireRole("AUTHOR", "ADMIN", "SUPER_ADMIN");

router.post("/", authMiddleware, anyAuthenticatedRole, (req, res) => controller.create(req, res));

router.patch("/:id", authMiddleware, anyAuthenticatedRole, (req, res) =>
	controller.update(req, res),
);

router.delete("/:id", authMiddleware, anyAuthenticatedRole, (req, res) =>
	controller.remove(req, res),
);

// Public reads — no auth.
// NOTE: "/:slug" is a GET wildcard. Any literal GET route added later
// (e.g. "/popular") must be registered ABOVE it or it will never be reached.
router.get("/:slug", (req, res) => controller.getBySlug(req, res));
router.get("/", (req, res) => controller.list(req, res));

export const tagRoutes = router;
