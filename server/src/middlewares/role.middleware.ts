import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

type Role = "SUPER_ADMIN" | "ADMIN" | "AUTHOR";

const hasRequiredRole = (userRole: Role, roles: Role[]): boolean => {
	if (userRole === "SUPER_ADMIN" && roles.includes("ADMIN")) {
		return true;
	}
	return roles.includes(userRole);
};

export const requireRole = (...roles: Role[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (!hasRequiredRole(req.user.role, roles)) {
			return res.status(403).json({ message: "Forbidden. You are not authorized to access this resource." });
		}

		return next();
	};
};

