import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../utils/httpError";
import { CategoryService } from "./category.service";
import {
	categoryListQuerySchema,
	createCategorySchema,
	updateCategorySchema,
} from "./category.validators";

const categoryService = new CategoryService();

const getId = (req: Request): string =>
	typeof req.params.id === "string" ? req.params.id : (req.params.id?.[0] ?? "");

const handleError = (res: Response, error: unknown, fallback: string) => {
	if (error instanceof HttpError) {
		return res.status(error.statusCode).json({ message: error.message });
	}
	console.error(error);
	return res.status(400).json({ message: fallback });
};

export class CategoryController {
	// GET /categories — public. Flat by default, nested under ?tree=true
	async list(req: Request, res: Response) {
		const parseResult = categoryListQuerySchema.safeParse(req.query);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid query parameters" });
		}

		const { tree, parentId } = parseResult.data;
		const result = await categoryService.list(tree, parentId);
		return res.status(200).json(result);
	}

	// GET /categories/:slug — public
	async getBySlug(req: Request, res: Response) {
		const slug = typeof req.params.slug === "string" ? req.params.slug : "";

		try {
			const category = await categoryService.getBySlug(slug);
			return res.status(200).json({ category });
		} catch (error) {
			return handleError(res, error, "Category not found");
		}
	}

	// POST /categories — ADMIN / SUPER_ADMIN
	async create(req: AuthenticatedRequest, res: Response) {
		const parseResult = createCategorySchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const category = await categoryService.create(parseResult.data);
			return res.status(201).json({ category });
		} catch (error) {
			return handleError(res, error, "Could not create category");
		}
	}

	// PATCH /categories/:id — ADMIN / SUPER_ADMIN
	async update(req: AuthenticatedRequest, res: Response) {
		const parseResult = updateCategorySchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const category = await categoryService.update(getId(req), parseResult.data);
			return res.status(200).json({ category });
		} catch (error) {
			return handleError(res, error, "Could not update category");
		}
	}

	// DELETE /categories/:id — ADMIN / SUPER_ADMIN
	async remove(req: AuthenticatedRequest, res: Response) {
		try {
			await categoryService.remove(getId(req));
			return res.status(204).send();
		} catch (error) {
			return handleError(res, error, "Could not delete category");
		}
	}
}
