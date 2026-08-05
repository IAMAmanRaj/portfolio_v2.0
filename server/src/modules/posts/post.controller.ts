import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../utils/httpError";
import { PostService } from "./post.service";
import {
	createPostSchema,
	postListQuerySchema,
	postManageQuerySchema,
	updatePostSchema,
} from "./post.validators";

const postService = new PostService();

const getId = (req: Request): string =>
	typeof req.params.id === "string" ? req.params.id : (req.params.id?.[0] ?? "");

const handleError = (res: Response, error: unknown, fallback: string) => {
	if (error instanceof HttpError) {
		return res.status(error.statusCode).json({ message: error.message });
	}
	console.error(error);
	return res.status(400).json({ message: fallback });
};

export class PostController {
	// GET /posts — public, published only
	async listPublished(req: Request, res: Response) {
		const parseResult = postListQuerySchema.safeParse(req.query);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid query parameters" });
		}

		const { page, limit, category, tag, q } = parseResult.data;
		const result = await postService.listPublished(page, limit, { category, tag, q });
		return res.status(200).json(result);
	}

	// GET /posts/:slug — public, published only
	async getPublishedBySlug(req: Request, res: Response) {
		const slug = typeof req.params.slug === "string" ? req.params.slug : "";

		try {
			const post = await postService.getPublishedBySlug(slug);
			return res.status(200).json({ post });
		} catch (error) {
			return handleError(res, error, "Post not found");
		}
	}

	// GET /posts/manage — authenticated (own posts for AUTHOR, all for ADMIN/SUPER_ADMIN)
	async listForManage(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const parseResult = postManageQuerySchema.safeParse(req.query);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid query parameters" });
		}

		const { page, limit, status } = parseResult.data;
		const result = await postService.listForManage(req.user, page, limit, status);
		return res.status(200).json(result);
	}

	// GET /posts/manage/:id
	async getForManage(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			const post = await postService.getForManage(req.user, getId(req));
			return res.status(200).json({ post });
		} catch (error) {
			return handleError(res, error, "Post not found");
		}
	}

	// POST /posts
	async create(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const parseResult = createPostSchema.safeParse(req.body);
		if (!parseResult.success) {
			return res.status(400).json({ message: "Invalid payload" });
		}

		try {
			const post = await postService.create(req.user, parseResult.data);
			return res.status(201).json({ post });
		} catch (error) {
			return handleError(res, error, "Could not create post");
		}
	}

	// PATCH /posts/manage/:id
	async update(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const parseResult = updatePostSchema.safeParse(req.body);
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? "Invalid payload";
			return res.status(400).json({ message });
		}

		try {
			const post = await postService.update(req.user, getId(req), parseResult.data);
			return res.status(200).json({ post });
		} catch (error) {
			return handleError(res, error, "Could not update post");
		}
	}

	// DELETE /posts/manage/:id
	async remove(req: AuthenticatedRequest, res: Response) {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			await postService.remove(req.user, getId(req));
			return res.status(204).send();
		} catch (error) {
			return handleError(res, error, "Could not delete post");
		}
	}
}
