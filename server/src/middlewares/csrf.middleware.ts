import { NextFunction, Response } from "express";
import { env } from "../config/env";
import { createCsrfToken, setCsrfCookie } from "../utils/csrf";
import { AuthenticatedRequest } from "./auth.middleware";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const getHeaderToken = (req: AuthenticatedRequest): string | undefined => {
	const value =
		(req.headers["x-csrf-token"] as string | undefined) ??
		(req.headers["csrf-token"] as string | undefined);
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

export const csrfMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	// Mounted only on routes that mutate state (currently /users/*).
	// /auth/* never runs this middleware: login has no session yet to protect,
	// and logout is intentionally left CSRF-free too (see auth.routes.ts).
	const cookieToken = req.cookies?.[env.csrfCookieName] as string | undefined;

	// Ensure a token exists for clients to read and send back on mutations.
	if (SAFE_METHODS.has(req.method)) {
		if (!cookieToken) {
			setCsrfCookie(res, createCsrfToken());
		}
		return next();
	}

	// Only enforce CSRF for cookie-authenticated requests.
	const hasAuthCookie = Boolean(req.cookies?.[env.cookieName]);
	if (!hasAuthCookie) {
		return next();
	}

	const headerToken = getHeaderToken(req);
	if (!cookieToken || !headerToken || cookieToken !== headerToken) {
		return res.status(403).json({ message: "CSRF token missing or invalid" });
	}

	return next();
};

