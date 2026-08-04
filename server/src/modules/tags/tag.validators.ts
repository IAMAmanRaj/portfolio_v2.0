import { z } from "zod";

const slugSchema = z
	.string()
	.min(1)
	.max(200)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only");

export const createTagSchema = z.object({
	name: z.string().min(1).max(50),
	slug: slugSchema.optional(),
});

export type CreateTagSchema = z.infer<typeof createTagSchema>;

export const updateTagSchema = z
	.object({
		name: z.string().min(1).max(50).optional(),
		slug: slugSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdateTagSchema = z.infer<typeof updateTagSchema>;
