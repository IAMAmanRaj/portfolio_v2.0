import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { MediaController } from "./media.controller";

const router = Router();
const controller = new MediaController();

// Same reasoning as tags: any author needs to attach a featured image to
// their own post, so this isn't ADMIN-gated.
const anyAuthenticatedRole = requireRole("AUTHOR", "ADMIN", "SUPER_ADMIN");

router.get(
	"/imagekit-auth",
	authMiddleware,
	anyAuthenticatedRole,
	(req, res) => controller.getImageKitUploadAuth(req, res),
);

export const mediaRoutes = router;
