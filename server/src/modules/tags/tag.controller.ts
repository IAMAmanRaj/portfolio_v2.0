import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../utils/httpError";
import { TagService } from "./tag.service";
import { createTagSchema, updateTagSchema } from "./tag.validators";

const tagService = new TagService();

const getId = (req: Request): string =>
	typeof req.params.id === "string" ? req.params.id : (req.params.id?.[0] ?? "");

const handleError = (res: Response, error: unknown, fallback: string) => {
	if (error instanceof HttpError) {
		return res.status(error.statusCode).json({ message: error.message });
	}
	console.error(error);
	return res.status(400).json({ message: fallback });
};

export class TagController {
	// GET /tags — public
	async list(_req: Request, res: Response) {
		const result = await tagService.list();
		return res.status(200).json(result);
	}

	// GET /tags/:slug — public
	async getBySlug(req: Request, res: Response) {
		const slug = typeof req.params.slug === "string" ? req.params.slug : "";

		try {
			const tag = await tagService.getBySlug(slug);
			return res.status(200).json({ tag });
		} catch (error) {
			return handleError(res, error, "Tag not found");
		}
	}

	// POST /tags — any authenticated role
	async create(req: AuthenticatedRequest, res: Response) {
		const parseResult = createTagSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const tag = await tagService.create(parseResult.data);
			return res.status(201).json({ tag });
		} catch (error) {
			return handleError(res, error, "Could not create tag");
		}
	}

	// PATCH /tags/:id — any authenticated role
	async update(req: AuthenticatedRequest, res: Response) {
		const parseResult = updateTagSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const tag = await tagService.update(getId(req), parseResult.data);
			return res.status(200).json({ tag });
		} catch (error) {
			return handleError(res, error, "Could not update tag");
		}
	}

	// DELETE /tags/:id — any authenticated role
	async remove(req: AuthenticatedRequest, res: Response) {
		try {
			await tagService.remove(getId(req));
			return res.status(204).send();
		} catch (error) {
			return handleError(res, error, "Could not delete tag");
		}
	}
}
