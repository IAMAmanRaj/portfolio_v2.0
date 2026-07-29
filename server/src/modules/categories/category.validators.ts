import { z } from "zod";

const slugSchema = z
	.string()
	.min(1)
	.max(200)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only");

// parentId is deliberately nullable: null is a meaningful value meaning
// "make this a root category", and is distinct from omitting the field.
const parentIdSchema = z.string().uuid("parentId must be a valid id").nullable();

export const createCategorySchema = z.object({
	name: z.string().min(1).max(100),
	slug: slugSchema.optional(),
	description: z.string().max(1000).optional(),
	parentId: parentIdSchema.optional(),
	sortOrder: z.number().int().min(0).max(9999).optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
	.object({
		name: z.string().min(1).max(100).optional(),
		slug: slugSchema.optional(),
		description: z.string().max(1000).optional(),
		parentId: parentIdSchema.optional(),
		sortOrder: z.number().int().min(0).max(9999).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;

export const categoryListQuerySchema = z.object({
	// Accepts ?tree=true / ?tree=1; anything else (including absent) means flat.
	tree: z
		.enum(["true", "false", "1", "0"])
		.optional()
		.transform((value) => value === "true" || value === "1"),
	parentId: z.string().uuid().optional(),
});
