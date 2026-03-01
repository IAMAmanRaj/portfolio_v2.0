import { hashPassword } from "../../utils/password";
import { UserRole } from "../../generated/prisma/client";
import { UserRepository } from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.types";

const userRepository = new UserRepository();

export class UserService {
	async createAuthor(input: CreateUserInput) {
		if (input.role !== UserRole.AUTHOR) {
			throw new Error("Only authors can be created");
		}

		const passwordHash = await hashPassword(input.password);

		return userRepository.createAuthor({
			...input,
			password: passwordHash,
		});
	}

	updateAuthor(id: string, input: UpdateUserInput) {
		return userRepository.updateAuthor(id, input);
	}

	deleteAuthor(id: string) {
		return userRepository.deleteAuthor(id);
	}
}

