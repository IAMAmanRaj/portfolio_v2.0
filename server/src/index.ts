import express from "express";
import cors from "cors";
import "dotenv/config";
import db from "./lib/db";

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
	res.json({ message: "Backend is up & running!" });
});

// Start server
async function startServer() {
	await testDatabaseConnection();

	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

startServer();
