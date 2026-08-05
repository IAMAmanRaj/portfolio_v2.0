import { z } from "zod";

export const createUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	displayName: z.string().min(1).max(200),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

const roleEnum = z.enum(["ADMIN", "AUTHOR"], {
	errorMap: () => ({ message: "Invalid role" }),
});

export const updateUserSchema = z
	.object({
		displayName: z.string().min(1).max(200).optional(),
		role: roleEnum.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

// Self-service profile editing (PATCH /users/me). Deliberately excludes
// email and role — those stay admin-managed, this is just "how I present
// myself," available to any authenticated role including AUTHOR.
export const updateOwnProfileSchema = z
	.object({
		displayName: z.string().min(1).max(200).optional(),
		bio: z.string().max(1000).nullable().optional(),
		avatarUrl: z.string().url("avatarUrl must be a valid URL").nullable().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "No fields to update",
	});

export type UpdateOwnProfileSchema = z.infer<typeof updateOwnProfileSchema>;

export const changeRoleSchema = z.object({
	role: z.enum(["ADMIN", "AUTHOR"], {
		errorMap: () => ({ message: "Invalid or missing role" }),
	}),
});

export type ChangeRoleSchema = z.infer<typeof changeRoleSchema>;
