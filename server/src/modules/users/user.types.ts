import { UserRole } from "../../generated/prisma/client";

export interface CreateUserInput {
	email: string;
	password: string;
	displayName: string;
	role: UserRole;
}

export interface UpdateUserInput {
	displayName?: string;
	role?: UserRole;
}

