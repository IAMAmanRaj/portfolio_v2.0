/// <reference types="node" />
import "dotenv/config";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/password";

const adapter = new PrismaPg({
	connectionString: requireEnv("DATABASE_URL"),
});

const prisma = new PrismaClient({
	adapter,
});

function requireEnv(key: string): string {
	const value = process.env[key];
if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}

async function main() {
	// ── SUPER ADMIN ──────────────────────────────────────────────
	const superAdminEmail = requireEnv("SEED_SUPER_ADMIN_EMAIL").trim().toLowerCase();
	const superAdminPassword = requireEnv("SEED_SUPER_ADMIN_PASSWORD");
	const superAdminDisplayName =
		(process.env.SEED_SUPER_ADMIN_DISPLAY_NAME ?? "").trim() ||
		superAdminEmail.split("@")[0] ||
		"Super Admin";

	if (superAdminPassword.length < 6) {
		throw new Error("SEED_SUPER_ADMIN_PASSWORD must be at least 6 characters");
	}

	const superAdminPasswordHash = await hashPassword(superAdminPassword);

	const superAdmin = await prisma.user.upsert({
		where: { email: superAdminEmail },
		update: {
			passwordHash: superAdminPasswordHash,
			displayName: superAdminDisplayName,
			role: UserRole.SUPER_ADMIN,
		},
		create: {
			email: superAdminEmail,
			passwordHash: superAdminPasswordHash,
			displayName: superAdminDisplayName,
			role: UserRole.SUPER_ADMIN,
		},
	});

	console.log("Seeded super admin:", {
		id: superAdmin.id,
		email: superAdmin.email,
		role: superAdmin.role,
	});

	// ── ADMINS ───────────────────────────────────────────────────
	// const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
	// if (adminPassword.length < 6) {
	// 	throw new Error("SEED_ADMIN_PASSWORD must be at least 6 characters");
	// }

	// const adminPasswordHash = await hashPassword(adminPassword);

	// const admins = [
	// 	{ email: "admin1@example.com", displayName: "Admin One" },
	// 	{ email: "admin2@example.com", displayName: "Admin Two" },
	// ] as const;

	// for (const { email, displayName } of admins) {
	// 	const normalizedEmail = email.trim().toLowerCase();
	// 	const seeded = await prisma.user.upsert({
	// 		where: { email: normalizedEmail },
	// 		update: {
	// 			passwordHash: adminPasswordHash,
	// 			displayName,
	// 			role: UserRole.ADMIN,
	// 		},
	// 		create: {
	// 			email: normalizedEmail,
	// 			passwordHash: adminPasswordHash,
	// 			displayName,
	// 			role: UserRole.ADMIN,
	// 		},
	// 	});
	// 	console.log("Seeded admin:", {
	// 		id: seeded.id,
	// 		email: seeded.email,
	// 		displayName: seeded.displayName,
	// 		role: seeded.role,
	// 	});
	// }

	// ── AUTHORS ──────────────────────────────────────────────────
	// const authorPassword = requireEnv("SEED_AUTHOR_PASSWORD");
	// if (authorPassword.length < 6) {
	// 	throw new Error("SEED_AUTHOR_PASSWORD must be at least 6 characters");
	// }

	// const authorPasswordHash = await hashPassword(authorPassword);

	// const authors = [
	// 	{ email: "author1@example.com", displayName: "Author One" },
	// 	{ email: "author2@example.com", displayName: "Author Two" },
	// ] as const;

	// for (const { email, displayName } of authors) {
	// 	const normalizedEmail = email.trim().toLowerCase();
	// 	const seeded = await prisma.user.upsert({
	// 		where: { email: normalizedEmail },
	// 		update: {
	// 			passwordHash: authorPasswordHash,
	// 			displayName,
	// 			role: UserRole.AUTHOR,
	// 		},
	// 		create: {
	// 			email: normalizedEmail,
	// 			passwordHash: authorPasswordHash,
	// 			displayName,
	// 			role: UserRole.AUTHOR,
	// 		},
	// 	});
	// 	console.log("Seeded author:", {
	// 		id: seeded.id,
	// 		email: seeded.email,
	// 		displayName: seeded.displayName,
	// 		role: seeded.role,
	// 	});
	// }
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