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

const app = express();
const PORT = env.port;

	// Test database connection
	async function testDatabaseConnection() {
		try {
			await db.$connect();
			console.log("Database connected");
			return true;
		} catch (error) {
			console.log("Database connection failed");
			console.error(error);
			return false;
		}
	}

	// Middleware
	app.use(express.json());
	app.use(cookieMiddleware);
	app.use(corsMiddleware);

	// Swagger UI
	setupSwagger(app);

	// Routes
	app.use("/auth", authRoutes);
	app.use("/users", userRoutes);
/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Backend is up and running
 */
app.get("/", (req, res) => {
	res.json({ message: "Backend is up & running!" });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Logged in successfully (HTTP-only cookie set)
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out and auth cookie cleared
 */

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Returns the current user
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new author (ADMIN only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update an author (ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, AUTHOR]
 *     responses:
 *       200:
 *         description: Author updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Author not found
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete an author (ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Author deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Author not found
 */

// Error handler (should be last)
app.use(errorMiddleware);

	async function startServer() {
		await testDatabaseConnection();

		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	}

	startServer();
