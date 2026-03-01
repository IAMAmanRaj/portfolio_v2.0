import { Response } from "express";
import { env } from "../config/env";

export const setAuthCookie = (res: Response, token: string): void => {
	res.cookie(env.cookieName, token, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000,
	});
};

export const clearAuthCookie = (res: Response): void => {
	res.clearCookie(env.cookieName, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "lax",
	});
};

