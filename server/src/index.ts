import express from "express";
import "dotenv/config";
import db from "./lib/db";
import { setupSwagger } from "./swagger";
import { env } from "./config/env";
import { corsMiddleware } from "./config/cors";
import { cookieMiddleware } from "./middlewares/auth.middleware";
import { csrfMiddleware } from "./middlewares/csrf.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { Router } from "express";



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
	app.use(csrfMiddleware);

	// Swagger UI
	setupSwagger(app);

	

	// Routes
	const v1 = Router();
	v1.use("/auth", authRoutes);
	v1.use("/users", userRoutes);
	v1.get("/health", (_req, res) => {
		res.json({ message: "Backend is up & running!" });
	});
	app.use("/api/v1", v1);

	
	app.use(errorMiddleware);

	app.listen(env.port, () => {
		console.log(`Server running on http://localhost:${env.port}`);
	});
}

startServer();
