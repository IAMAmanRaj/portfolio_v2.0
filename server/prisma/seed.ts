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

	// No blended/shared "sample password" fallback: admin gets its own
	// password, authors share one password between the two of them (not a
	// fallback chain — a deliberate single shared credential, since the two
	// authors exist to test author-vs-author permission boundaries, not
	// credential isolation from each other).
	const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
	const authorPassword = requireEnv("SEED_AUTHOR_PASSWORD");

	if (adminPassword.length < 6) {
		throw new Error("SEED_ADMIN_PASSWORD must be at least 6 characters");
	}
	if (authorPassword.length < 6) {
		throw new Error("SEED_AUTHOR_PASSWORD must be at least 6 characters");
	}

	const adminPasswordHash = await hashPassword(adminPassword);
	const authorPasswordHash = await hashPassword(authorPassword);

	// Two authors, not one, deliberately: the AUTHOR role is scoped to its own
	// posts, and you cannot test "author A cannot touch author B's post" with
	// a single author account.
	const sampleUsers = [
		{
			email: (process.env.SEED_ADMIN_EMAIL || "admin@example.com").trim().toLowerCase(),
			displayName: "Admin",
			role: UserRole.ADMIN,
			passwordHash: adminPasswordHash,
		},
		{
			email: "author1@example.com",
			displayName: "Author One",
			role: UserRole.AUTHOR,
			passwordHash: authorPasswordHash,
		},
		{
			email: "author2@example.com",
			displayName: "Author Two",
			role: UserRole.AUTHOR,
			passwordHash: authorPasswordHash,
		},
	] as const;

	for (const { email, displayName, role, passwordHash } of sampleUsers) {
		// Guard against SEED_ADMIN_EMAIL accidentally matching the super admin —
		// upserting it would silently demote the one account that can't be
		// recreated through the API.
		if (email === superAdminEmail) {
			console.log(`Skipped ${email} — same address as the super admin.`);
			continue;
		}

		const seeded = await prisma.user.upsert({
			where: { email },
			update: { passwordHash, displayName, role },
			create: { email, passwordHash, displayName, role },
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