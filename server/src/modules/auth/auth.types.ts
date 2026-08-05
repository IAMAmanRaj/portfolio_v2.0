import { UserRole } from "../../generated/prisma/client";

export interface LoginInput {
	email: string;
	password: string;
}

export interface AuthUser {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	bio: string | null;
	avatarUrl: string | null;
}

