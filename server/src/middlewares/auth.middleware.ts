import { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import { verifyJwt } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: "ADMIN" | "AUTHOR";
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

	try {
		const payload = verifyJwt(token);
		req.user = {
			id: payload.sub,
			email: payload.email,
			role: payload.role,
		};
		return next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid token" });
	}
};

