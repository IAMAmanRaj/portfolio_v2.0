import "dotenv/config";

export type NodeEnv = "development" | "test" | "production";

const getEnv = (key: string, fallback?: string): string => {
	const value = process.env[key] ?? fallback;
	if (value === undefined) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
};

export const env = {
	nodeEnv: (process.env.NODE_ENV as NodeEnv) || "development",
	port: Number(process.env.PORT) || 5000,
	clientOrigin: getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
	jwtSecret: getEnv("JWT_SECRET"),
	jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "1d"),
	cookieName: getEnv("AUTH_COOKIE_NAME", "portfolio_auth_token"),
	isProduction: (process.env.NODE_ENV || "development") === "production",
};

