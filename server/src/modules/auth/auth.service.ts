import db from "../../lib/db";
import { verifyPassword } from "../../utils/password";
import { signJwt } from "../../utils/jwt";
import { AuthUser, LoginInput } from "./auth.types";

export class AuthService {
	async login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
		const user = await db.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			throw new Error("Invalid credentials");
		}

		const valid = await verifyPassword(input.password, user.passwordHash);
		if (!valid) {
			throw new Error("Invalid credentials");
		}

		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		const token = signJwt(payload);

		const authUser: AuthUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			role: user.role,
		};

		return { user: authUser, token };
	}

	async getMe(userId: string): Promise<AuthUser | null> {
		const user = await db.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			role: user.role,
		};
	}
}

