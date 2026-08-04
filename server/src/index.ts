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
import { postRoutes } from "./modules/posts/post.routes";
import { categoryRoutes } from "./modules/categories/category.routes";
import { tagRoutes } from "./modules/tags/tag.routes";
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

	// Swagger UI
	setupSwagger(app);



	// Routes
	const v1 = Router();
	// Auth routes (login/logout/me) never need CSRF: login has no session yet
	// to protect, logout is exempted by design, and /me is a read-only GET.
	v1.use("/auth", authRoutes);
	// CSRF is only enforced here, on the routes that actually mutate state.
	v1.use("/users", csrfMiddleware, userRoutes);
	v1.use("/posts", csrfMiddleware, postRoutes);
	v1.use("/categories", csrfMiddleware, categoryRoutes);
	v1.use("/tags", csrfMiddleware, tagRoutes);
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
