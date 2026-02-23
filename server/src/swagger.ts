import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "Portfolio v2.0 API",
		version: "1.0.0",
		description: "API documentation for the Portfolio v2.0 backend",
	},
	servers: [
		{
			url: "http://localhost:5000",
			description: "Local server",
		},
	],
};

const swaggerOptions = {
	definition: swaggerDefinition,
	apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

