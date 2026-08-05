import { z } from "zod";

const slugSchema = z
	.string()
	.min(1)
	.max(200)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only");

// Replace-set arrays: whatever is sent is exactly what the post ends up
// linked to. Unknown ids are rejected in the service (400, id named in the
// message) rather than silently dropped here.
const categoryIdsSchema = z.array(z.string().uuid("categoryIds must contain valid ids"));
const tagIdsSchema = z.array(z.string().uuid("tagIds must contain valid ids"));

export const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	slug: slugSchema.optional(),
	content: z.string().min(1),
	excerpt: z.string().max(500).optional(),
	featuredImage: z.string().url().optional(),
	isPinned: z.boolean().optional(),
	categoryIds: categoryIdsSchema.optional(),
	tagIds: tagIdsSchema.optional(),
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
		// Send [] to clear all categories/tags; omit the field to leave them alone.
		categoryIds: categoryIdsSchema.optional(),
		tagIds: tagIdsSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;

const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Filters for the public list. category/tag are slugs (the public identifier,
// same as /categories/:slug and /tags/:slug) rather than ids. All three are
// combined with AND when more than one is present — each narrows the result
// further rather than broadening it.
const postFilterSchema = z.object({
	category: z.string().min(1).max(200).optional(),
	tag: z.string().min(1).max(200).optional(),
	q: z.string().min(1).max(200).optional(),
});

export const postListQuerySchema = paginationSchema.merge(postFilterSchema);

export const postManageQuerySchema = paginationSchema.extend({
	status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});
