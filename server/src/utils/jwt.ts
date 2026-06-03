import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
	sub: string;
	email: string;
	role: "SUPER_ADMIN" | "ADMIN" | "AUTHOR";
}

export const signJwt = (payload: JwtPayload): string => {
	return jwt.sign(payload, env.jwtSecret, {
		expiresIn: env.jwtExpiresIn,
	} as jwt.SignOptions);
};

export const verifyJwt = (token: string): JwtPayload => {
	return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
