import { UserRole } from "../../generated/prisma/client";
import db from "../../lib/db";
import { CreateUserInput, UpdateUserInput } from "./user.types";

export const userPublicSelect = {
	id: true,
	email: true,
	displayName: true,
	role: true,
	bio: true,
	avatarUrl: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class UserRepository {
	createUser(data: CreateUserInput) {
		return db.user.create({
			data: {
				email: data.email,
				passwordHash: data.password,
				displayName: data.displayName,
				role: data.role,
			},
			select: userPublicSelect,
		});
	}

	findById(id: string) {
		return db.user.findUnique({ where: { id } });
	}

	findAuthors() {
		return db.user.findMany({
			where: { role: UserRole.AUTHOR },
			orderBy: { createdAt: "asc" },
			select: userPublicSelect,
		});
	}

	updateAuthor(id: string, data: UpdateUserInput) {
		return db.user.update({
			where: { id },
			data,
			select: userPublicSelect,
		});
	}

	deleteById(id: string) {
		return db.user.delete({
			where: { id },
		});
	}
}

