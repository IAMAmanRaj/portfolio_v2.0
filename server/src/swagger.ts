import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "Portfolio v2.0 API",
		version: "1.0.0",
		description:
			"API documentation for the Portfolio v2.0 backend.\n\n" +
			"Auth is cookie-based (an httpOnly JWT cookie), not a bearer token. " +
			"Because this page is served from the same origin as the API, logging in " +
			"via POST /auth/login below sets the auth cookie in your browser and every " +
			"subsequent \"Try it out\" call on this page will carry it automatically — " +
			"no manual token entry needed.\n\n" +
			"For any mutating request under /users/*, /posts/*, /categories/*, /tags/* or /media/* (POST/PATCH/DELETE), " +
			"you also need to send the x-csrf-token header. Read the value from the " +
			"csrf_token cookie (set alongside the auth cookie at login) via your browser's " +
			"dev tools, and paste it into the X-Csrf-Token field on that request.",
	},
	servers: [
		{
			url: "http://localhost:5000/api/v1",
			description: "Local server",
		},
	],
	components: {
		parameters: {
			CsrfHeader: {
				in: "header",
				name: "x-csrf-token",
				required: true,
				schema: { type: "string" },
				description:
					"Required for this request. Copy the value of the csrf_token cookie (set at login) and paste it here.",
			},
		},
	},
};

const swaggerOptions = {
	definition: swaggerDefinition,
	apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

