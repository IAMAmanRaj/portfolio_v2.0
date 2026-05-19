import { Prisma, UserRole } from "../../generated/prisma/client";
import { HttpError } from "../../utils/httpError";
import { hashPassword } from "../../utils/password";
import { UserRepository } from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.types";

const userRepository = new UserRepository();

export class UserService {
	listAuthors() {
		return userRepository.findAuthors();
	}

	async createAuthor(input: CreateUserInput) {
		if (input.role !== UserRole.AUTHOR) {
			throw new Error("Only authors can be created");
		}

		const passwordHash = await hashPassword(input.password);

		return userRepository.createUser({
			...input,
			password: passwordHash,
		});
	}

	async createAdmin(input: CreateUserInput) {
		if (input.role !== UserRole.ADMIN) {
			throw new Error("Only administrators can be created with this action");
		}

		const passwordHash = await hashPassword(input.password);

		return userRepository.createUser({
			...input,
			password: passwordHash,
		});
	}

	async updateAuthor(id: string, input: UpdateUserInput, actorId: string) {
		if (input.role !== undefined) {
			const target = await userRepository.findById(id);
			if (!target) {
				throw new HttpError(404, "User not found");
			}
			if (target.role === UserRole.ADMIN && target.id !== actorId) {
				throw new HttpError(403, "Cannot change another administrator's role");
			}
		}

		try {
			return await userRepository.updateAuthor(id, input);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				throw new HttpError(404, "User not found");
			}
			throw error;
		}
	}

	async changeRole(targetId: string, role: UserRole, actorId: string) {
		return this.updateAuthor(targetId, { role }, actorId);
	}

	async deleteAuthor(id: string, actorId: string) {
		const target = await userRepository.findById(id);
		if (!target) {
			throw new HttpError(404, "User not found");
		}
		if (target.role !== UserRole.AUTHOR) {
			throw new HttpError(
				400,
				"Only author accounts can be removed with this action",
			);
		}
		if (target.id === actorId) {
			throw new HttpError(400, "Cannot delete your own account");
		}
		await userRepository.deleteById(id);
	}

	async deleteAdmin(id: string, actorId: string) {
		const target = await userRepository.findById(id);
		if (!target) {
			throw new HttpError(404, "User not found");
		}
		if (target.role !== UserRole.ADMIN) {
			throw new HttpError(
				400,
				"Only administrator accounts can be removed with this action",
			);
		}
		if (target.id === actorId) {
			throw new HttpError(
				400,
				"Cannot delete your own administrator account",
			);
		}
		await userRepository.deleteById(id);
	}
}
