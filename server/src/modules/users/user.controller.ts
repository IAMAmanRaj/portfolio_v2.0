import { Response } from "express";
import { UserRole } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../utils/httpError";
import { UserService } from "./user.service";
import {
	changeRoleSchema,
	createUserSchema,
	updateOwnProfileSchema,
	updateUserSchema,
} from "./user.validators";

const userService = new UserService();

export class UserController {
	async listAuthors(_req: AuthenticatedRequest, res: Response) {
		const authors = await userService.listAuthors();
		return res.status(200).json({ users: authors });
	}

	async createAuthor(req: AuthenticatedRequest, res: Response) {
		const parseResult = createUserSchema.safeParse(req.body);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid payload" });
		}

		try {
			const author = await userService.createAuthor({
				...parseResult.data,
				role: UserRole.AUTHOR,
			});
			return res.status(201).json({ user: author });
		} catch {
			return res.status(400).json({ message: "Could not create author" });
		}
	}

	async createAdmin(req: AuthenticatedRequest, res: Response) {
		const parseResult = createUserSchema.safeParse(req.body);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid payload" });
		}

		try {
			const admin = await userService.createAdmin({
				...parseResult.data,
				role: UserRole.ADMIN,
			});
			return res.status(201).json({ user: admin });
		} catch {
			return res.status(400).json({ message: "Could not create administrator" });
		}
	}

	async updateAuthor(req: AuthenticatedRequest, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

		const parseResult = updateUserSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const updated = await userService.updateAuthor(id, parseResult.data, req.user!.id);
			return res.status(200).json({ user: updated });
		} catch (error) {
			if (error instanceof HttpError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(404).json({ message: "User not found" });
		}
	}

	async updateProfile(req: AuthenticatedRequest, res: Response) {
		const parseResult = updateOwnProfileSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const updated = await userService.updateOwnProfile(req.user!.id, parseResult.data);
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

		const parseResult = changeRoleSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid or missing role";
			return res.status(400).json({ message });
		}

		try {
			const updated = await userService.changeRole(id, parseResult.data.role, req.user!.id);
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
