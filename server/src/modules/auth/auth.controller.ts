import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { clearAuthCookie, setAuthCookie } from "../../utils/cookies";
import { AuthService } from "./auth.service";
import { loginSchema } from "./auth.validators";

const authService = new AuthService();

export class AuthController {
	async login(req: Request, res: Response) {
		const parseResult = loginSchema.safeParse(req.body);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid payload" });
		}

		try {
			const { user, token } = await authService.login(parseResult.data);
			setAuthCookie(res, token);
			return res.status(200).json({ user });
		} catch {
			return res.status(401).json({ message: "Invalid credentials" });
		}
	}

	async logout(_req: Request, res: Response) {
		clearAuthCookie(res);
		return res.status(200).json({ message: "Logged out" });
	}

	async me(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const user = await authService.getMe(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({ user });
	}
}

