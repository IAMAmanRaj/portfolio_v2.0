import express from "express";
import "dotenv/config";
import db from "./lib/db";
import { setupSwagger } from "./swagger";
import { env } from "./config/env";
import { corsMiddleware } from "./config/cors";
import { cookieMiddleware } from "./middlewares/auth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";

async function startServer() {
	try {
		await db.$connect();
		console.log("Database connected");
	} catch (error) {
		console.log("Database connection failed");
		console.error(error);
		process.exit(1);
	}

	const app = express();

	// Middleware
	app.use(express.json());
	app.use(cookieMiddleware);
	app.use(corsMiddleware);

	// Swagger UI
	setupSwagger(app);

	// Routes
	app.use("/auth", authRoutes);
	app.use("/users", userRoutes);

	// Health check
	app.get("/", (_req, res) => {
		res.json({ message: "Backend is up & running!" });
	});

	// Error handler (should be last)
	app.use(errorMiddleware);

	app.listen(env.port, () => {
		console.log(`Server running on http://localhost:${env.port}`);
	});
}

startServer();
