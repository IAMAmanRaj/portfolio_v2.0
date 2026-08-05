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

	// ── SAMPLE USERS (non-production only) ───────────────────────
	// Never seed predictable throwaway accounts into production — that would
	// be handing out known credentials on a live system.
	if (process.env.NODE_ENV === "production") {
		console.log("NODE_ENV=production — skipping sample admin/author users.");
		return;
	}

	// Falls back through the passwords already in .env so this works without
	// anyone having to add new variables. That fallback is exactly why these
	// blocks sat commented out: they required SEED_ADMIN_PASSWORD and
	// SEED_AUTHOR_PASSWORD to exist, and threw at startup when they didn't.
	const samplePassword =
		process.env.SEED_SAMPLE_PASSWORD ||
		process.env.SEED_ADMIN_PASSWORD ||
		superAdminPassword;

	if (samplePassword.length < 6) {
		throw new Error("Sample user password must be at least 6 characters");
	}

	const samplePasswordHash = await hashPassword(samplePassword);

	// Two authors, not one, deliberately: the AUTHOR role is scoped to its own
	// posts, and you cannot test "author A cannot touch author B's post" with
	// a single author account.
	const sampleUsers = [
		{
			email: (process.env.SEED_ADMIN_EMAIL || "admin@example.com").trim().toLowerCase(),
			displayName: "Sample Admin",
			role: UserRole.ADMIN,
		},
		{ email: "author1@example.com", displayName: "Author One", role: UserRole.AUTHOR },
		{ email: "author2@example.com", displayName: "Author Two", role: UserRole.AUTHOR },
	] as const;

	for (const { email, displayName, role } of sampleUsers) {
		// Guard against SEED_ADMIN_EMAIL accidentally matching the super admin —
		// upserting it would silently demote the one account that can't be
		// recreated through the API.
		if (email === superAdminEmail) {
			console.log(`Skipped ${email} — same address as the super admin.`);
			continue;
		}

		const seeded = await prisma.user.upsert({
			where: { email },
			update: { passwordHash: samplePasswordHash, displayName, role },
			create: { email, passwordHash: samplePasswordHash, displayName, role },
		});

		console.log("Seeded sample user:", {
			email: seeded.email,
			displayName: seeded.displayName,
			role: seeded.role,
		});
	}
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