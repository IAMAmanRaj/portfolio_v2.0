import { Prisma } from "../../generated/prisma/client";
import db from "../../lib/db";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";

export const categorySelect = {
	id: true,
	name: true,
	slug: true,
	description: true,
	parentId: true,
	sortOrder: true,
	createdAt: true,
	updatedAt: true,
} as const;

interface CreateCategoryData extends CreateCategoryInput {
	slug: string;
}

export class CategoryRepository {
	// Ordered so the tree builder and any admin dropdown get a stable,
	// human-meaningful sequence without re-sorting downstream.
	findMany(parentId?: string) {
		const where: Prisma.CategoryWhereInput = parentId ? { parentId } : {};

		return db.category.findMany({
			where,
			select: categorySelect,
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});
	}

	findBySlug(slug: string) {
		return db.category.findUnique({
			where: { slug },
			select: categorySelect,
		});
	}

	findById(id: string) {
		return db.category.findUnique({
			where: { id },
			select: categorySelect,
		});
	}

	// Raw row (no select projection) — used internally for existence and
	// parent-chain checks where the projection would only get in the way.
	findRawById(id: string) {
		return db.category.findUnique({ where: { id } });
	}

	async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const existing = await db.category.findUnique({ where: { slug }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	async nameExists(name: string, excludeId?: string): Promise<boolean> {
		const existing = await db.category.findUnique({ where: { name }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	countChildren(id: string): Promise<number> {
		return db.category.count({ where: { parentId: id } });
	}

	countPostLinks(id: string): Promise<number> {
		return db.postCategory.count({ where: { categoryId: id } });
	}

	create(data: CreateCategoryData) {
		return db.category.create({
			data: {
				name: data.name,
				slug: data.slug,
				description: data.description,
				parentId: data.parentId ?? null,
				sortOrder: data.sortOrder ?? 0,
			},
			select: categorySelect,
		});
	}

	updateById(id: string, data: UpdateCategoryInput) {
		return db.category.update({
			where: { id },
			data,
			select: categorySelect,
		});
	}

	deleteById(id: string) {
		return db.category.delete({ where: { id } });
	}
}
