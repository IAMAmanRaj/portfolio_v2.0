import { z } from "zod";

const slugSchema = z
	.string()
	.min(1)
	.max(200)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only");

export const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	slug: slugSchema.optional(),
	content: z.string().min(1),
	excerpt: z.string().max(500).optional(),
	featuredImage: z.string().url().optional(),
	isPinned: z.boolean().optional(),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
	.object({
		title: z.string().min(1).max(200).optional(),
		slug: slugSchema.optional(),
		content: z.string().min(1).optional(),
		excerpt: z.string().max(500).optional(),
		featuredImage: z.string().url().optional(),
		isPinned: z.boolean().optional(),
		status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;

const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const postListQuerySchema = paginationSchema;

export const postManageQuerySchema = paginationSchema.extend({
	status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});
