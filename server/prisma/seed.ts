/// <reference types="node" />
import "dotenv/config";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/password";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
	adapter,
});

const requireEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
};

async function main() {
	const email = requireEnv("SEED_ADMIN_EMAIL").trim().toLowerCase();
	const password = requireEnv("SEED_ADMIN_PASSWORD");
	const displayName =
		(process.env.SEED_ADMIN_DISPLAY_NAME ?? "").trim() ||
		email.split("@")[0] ||
		"Admin";

	if (password.length < 6) {
		throw new Error("SEED_ADMIN_PASSWORD must be at least 6 characters");
	}

	const passwordHash = await hashPassword(password);

	const user = await prisma.user.upsert({
		where: { email },
		update: {
			passwordHash,
			displayName,
			role: UserRole.ADMIN,
		},
		create: {
			email,
			passwordHash,
			displayName,
			role: UserRole.ADMIN,
		},
	});

	console.log("Seeded admin user:", { id: user.id, email: user.email, role: user.role });
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
