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

export const changeRoleSchema = z.object({
	role: z.enum(["ADMIN", "AUTHOR"], {
		errorMap: () => ({ message: "Invalid or missing role" }),
	}),
});

export type ChangeRoleSchema = z.infer<typeof changeRoleSchema>;
