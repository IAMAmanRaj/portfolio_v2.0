import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { CategoryController } from "./category.controller";

const router = Router();
const controller = new CategoryController();

// Categories are site structure rather than content, so management is stricter
// than posts: ADMIN only (SUPER_ADMIN inherits this via requireRole).
const adminOnly = requireRole("ADMIN");

router.post("/", authMiddleware, adminOnly, (req, res) => controller.create(req, res));

router.patch("/:id", authMiddleware, adminOnly, (req, res) => controller.update(req, res));

router.delete("/:id", authMiddleware, adminOnly, (req, res) => controller.remove(req, res));

// Public reads — no auth.
// NOTE: "/:slug" is a GET wildcard. Any literal GET route added later
// (e.g. "/tree") must be registered ABOVE it or it will never be reached.
router.get("/:slug", (req, res) => controller.getBySlug(req, res));
router.get("/", (req, res) => controller.list(req, res));

export const categoryRoutes = router;
