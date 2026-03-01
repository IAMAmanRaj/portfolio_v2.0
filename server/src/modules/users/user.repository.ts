import db from "../../lib/db";
import { CreateUserInput, UpdateUserInput } from "./user.types";

export class UserRepository {
	createAuthor(data: CreateUserInput) {
		return db.user.create({
			data: {
				email: data.email,
				passwordHash: data.password,
				displayName: data.displayName,
				role: data.role,
			},
		});
	}

	updateAuthor(id: string, data: UpdateUserInput) {
		return db.user.update({
			where: { id },
			data,
		});
	}

	deleteAuthor(id: string) {
		return db.user.delete({
			where: { id },
		});
	}
}

