import { Response } from "express";
import { UserRole } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../utils/httpError";
import { UserService } from "./user.service";

const userService = new UserService();

const isUserRole = (value: unknown): value is UserRole =>
	value === UserRole.ADMIN || value === UserRole.AUTHOR;

export class UserController {
	async listAuthors(_req: AuthenticatedRequest, res: Response) {
		const authors = await userService.listAuthors();
		return res.status(200).json({ users: authors });
	}

	async createAuthor(req: AuthenticatedRequest, res: Response) {
		const { email, password, displayName } = req.body as {
			email?: string;
			password?: string;
			displayName?: string;
		};

		if (!email || !password || !displayName) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			const author = await userService.createAuthor({
				email,
				password,
				displayName,
				role: UserRole.AUTHOR,
			});
			return res.status(201).json({ user: author });
		} catch {
			return res.status(400).json({ message: "Could not create author" });
		}
	}

	async createAdmin(req: AuthenticatedRequest, res: Response) {
		const { email, password, displayName } = req.body as {
			email?: string;
			password?: string;
			displayName?: string;
		};

		if (!email || !password || !displayName) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			const admin = await userService.createAdmin({
				email,
				password,
				displayName,
				role: UserRole.ADMIN,
			});
			return res.status(201).json({ user: admin });
		} catch {
			return res.status(400).json({ message: "Could not create administrator" });
		}
	}

	async updateAuthor(req: AuthenticatedRequest, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
		const { displayName, role } = req.body as {
			displayName?: string;
			role?: UserRole;
		};

		if (role !== undefined && !isUserRole(role)) {
			return res.status(400).json({ message: "Invalid role" });
		}

		const patch: { displayName?: string; role?: UserRole } = {};
		if (displayName !== undefined) {
			patch.displayName = displayName;
		}
		if (role !== undefined) {
			patch.role = role;
		}

		if (Object.keys(patch).length === 0) {
			return res.status(400).json({ message: "No fields to update" });
		}

		try {
			const updated = await userService.updateAuthor(id, patch, req.user!.id);
			return res.status(200).json({ user: updated });
		} catch (error) {
			if (error instanceof HttpError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(404).json({ message: "User not found" });
		}
	}

	async changeRole(req: AuthenticatedRequest, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
		const { role } = req.body as { role?: unknown };

		if (!isUserRole(role)) {
			return res.status(400).json({ message: "Invalid or missing role" });
		}

		try {
			const updated = await userService.changeRole(id, role, req.user!.id);
			return res.status(200).json({ user: updated });
		} catch (error) {
			if (error instanceof HttpError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(404).json({ message: "User not found" });
		}
	}

	async deleteAuthor(req: AuthenticatedRequest, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

		try {
			await userService.deleteAuthor(id, req.user!.id);
			return res.status(204).send();
		} catch (error) {
			if (error instanceof HttpError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(404).json({ message: "User not found" });
		}
	}

	async deleteAdmin(req: AuthenticatedRequest, res: Response) {
		const id =
			typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

		try {
			await userService.deleteAdmin(id, req.user!.id);
			return res.status(204).send();
		} catch (error) {
			if (error instanceof HttpError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(404).json({ message: "User not found" });
		}
	}
}
