import { Request, Response } from "express";
import { UserRole } from "../../generated/prisma/client";
import { UserService } from "./user.service";

const userService = new UserService();

export class UserController {
	async createAuthor(req: Request, res: Response) {
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
		} catch (error) {
			return res.status(400).json({ message: "Could not create author" });
		}
	}

	async updateAuthor(req: Request, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
		const { displayName, role } = req.body as {
			displayName?: string;
			role?: UserRole;
		};

		if (!displayName && !role) {
			return res.status(400).json({ message: "No fields to update" });
		}

		try {
			const updated = await userService.updateAuthor(id, {
				displayName,
				role,
			});
			return res.status(200).json({ user: updated });
		} catch {
			return res.status(404).json({ message: "Author not found" });
		}
	}

	async deleteAuthor(req: Request, res: Response) {
		const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

		try {
			await userService.deleteAuthor(id);
			return res.status(204).send();
		} catch {
			return res.status(404).json({ message: "Author not found" });
		}
	}
}

