import crypto from "crypto";
import { Response } from "express";
import { env } from "../config/env";

export const createCsrfToken = (): string => {
	return crypto.randomBytes(32).toString("base64url");
};

export const setCsrfCookie = (res: Response, token: string): void => {
	res.cookie(env.csrfCookieName, token, {
		httpOnly: false,
		secure: env.isProduction,
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000,
	});
};

export const clearCsrfCookie = (res: Response): void => {
	res.clearCookie(env.csrfCookieName, {
		httpOnly: false,
		secure: env.isProduction,
		sameSite: "lax",
	});
};

