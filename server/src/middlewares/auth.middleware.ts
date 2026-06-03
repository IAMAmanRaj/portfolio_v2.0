import { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import db from "../lib/db";
import { verifyJwt } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: "SUPER_ADMIN" | "ADMIN" | "AUTHOR";
	};
}

export const cookieMiddleware = cookieParser();

export const authMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = req.cookies?.[env.cookieName];

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const payload = (() => {
		try {
			return verifyJwt(token);
		} catch {
			return null;
		}
	})();

	if (!payload) {
		return res.status(401).json({ message: "Invalid token" });
	}

	db.user
		.findUnique({
			where: { id: payload.sub },
			select: {
				id: true,
				email: true,
				role: true,
			},
		})
		.then((user) => {
			if (!user) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			req.user = {
				id: user.id,
				email: user.email,
				role: user.role,
			};
			return next();
		})
		.catch(next);
};

