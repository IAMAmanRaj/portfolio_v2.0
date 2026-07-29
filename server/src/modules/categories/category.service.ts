import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { CategoryRepository } from "./category.repository";
import {
	CategoryNode,
	CategorySummary,
	CreateCategoryInput,
	UpdateCategoryInput,
} from "./category.types";

const categoryRepository = new CategoryRepository();

// Bounds the ancestor walk. A chain deeper than this means the data is already
// corrupt (most likely a pre-existing cycle), so fail loudly rather than spin.
const MAX_TREE_DEPTH = 50;

export class CategoryService {
	async list(tree: boolean, parentId?: string) {
		if (!tree) {
			const categories = await categoryRepository.findMany(parentId);
			return { categories };
		}

		// The tree is assembled from one full read rather than a query per level:
		// the taxonomy is small, and recursive fetching would be N+1 by design.
		const all = await categoryRepository.findMany();
		return { categories: buildTree(all, parentId ?? null) };
	}

	async getBySlug(slug: string) {
		const category = await categoryRepository.findBySlug(slug);
		if (!category) {
			throw new HttpError(404, "Category not found");
		}
		return category;
	}

	async create(input: CreateCategoryInput) {
		const nameTaken = await categoryRepository.nameExists(input.name);
		if (nameTaken) {
			throw new HttpError(409, "Category name already in use");
		}

		if (input.parentId) {
			await this.assertParentExists(input.parentId);
		}

		const slug = await this.resolveSlug(input.slug, input.name);

		return categoryRepository.create({ ...input, slug });
	}

	async update(id: string, input: UpdateCategoryInput) {
		const existing = await categoryRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Category not found");
		}

		if (input.name && input.name !== existing.name) {
			const nameTaken = await categoryRepository.nameExists(input.name, id);
			if (nameTaken) {
				throw new HttpError(409, "Category name already in use");
			}
		}

		if (input.slug && input.slug !== existing.slug) {
			const slugTaken = await categoryRepository.slugExists(input.slug, id);
			if (slugTaken) {
				throw new HttpError(409, "Slug already in use");
			}
		}

		// Only validate the move when parentId is actually part of the payload.
		// `undefined` means "leave it alone"; `null` means "make this a root".
		if (input.parentId !== undefined && input.parentId !== existing.parentId) {
			await this.assertMoveIsLegal(id, input.parentId);
		}

		return categoryRepository.updateById(id, input);
	}

	async remove(id: string) {
		const existing = await categoryRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Category not found");
		}

		// The schema cascades on the self-relation, which would silently delete
		// the entire subtree. Refuse instead and make the caller be explicit.
		const childCount = await categoryRepository.countChildren(id);
		if (childCount > 0) {
			throw new HttpError(
				409,
				`Cannot delete a category that has ${childCount} sub-categor${childCount === 1 ? "y" : "ies"}. Move or delete them first.`,
			);
		}

		// Post links do cascade, and that is intended: removing a category
		// unfiles its posts, it does not delete them.
		await categoryRepository.deleteById(id);
	}

	private async resolveSlug(requested: string | undefined, name: string): Promise<string> {
		if (requested) {
			// Explicitly chosen — don't silently rewrite it.
			const taken = await categoryRepository.slugExists(requested);
			if (taken) {
				throw new HttpError(409, "Slug already in use");
			}
			return requested;
		}
		return this.dedupeSlug(slugify(name));
	}

	private async dedupeSlug(baseSlug: string): Promise<string> {
		let candidate = baseSlug;
		let suffix = 2;
		while (await categoryRepository.slugExists(candidate)) {
			candidate = `${baseSlug}-${suffix}`;
			suffix += 1;
			if (suffix > 50) {
				throw new HttpError(500, "Could not generate a unique slug");
			}
		}
		return candidate;
	}

	private async assertParentExists(parentId: string) {
		const parent = await categoryRepository.findRawById(parentId);
		if (!parent) {
			throw new HttpError(400, "Parent category not found");
		}
	}

	/**
	 * Guards the three ways a reparent can corrupt the hierarchy:
	 *   1. pointing a category at itself
	 *   2. pointing at a parent that doesn't exist
	 *   3. pointing at one of its own descendants — which would detach that
	 *      whole branch from the tree into an unreachable cycle
	 *
	 * Postgres enforces none of these, so the check has to live here.
	 */
	private async assertMoveIsLegal(id: string, newParentId: string | null) {
		if (newParentId === null) {
			return; // Promoting to a root is always safe.
		}

		if (newParentId === id) {
			throw new HttpError(400, "A category cannot be its own parent");
		}

		await this.assertParentExists(newParentId);

		// Walk up from the proposed parent. If we reach `id`, the proposed
		// parent sits below us and the move would close a loop.
		let cursorId: string | null = newParentId;
		let depth = 0;

		while (cursorId) {
			if (depth > MAX_TREE_DEPTH) {
				throw new HttpError(500, "Category hierarchy is too deep to validate");
			}

			const cursor: { id: string; parentId: string | null } | null =
				await categoryRepository.findRawById(cursorId);
			if (!cursor) break;

			if (cursor.parentId === id) {
				throw new HttpError(400, "Cannot move a category under one of its own descendants");
			}

			cursorId = cursor.parentId;
			depth += 1;
		}
	}
}

/**
 * Turns a flat list into nested nodes in a single pass over the data.
 * `rootParentId` of null yields the whole tree; passing an id yields the
 * subtree hanging beneath that category.
 */
const buildTree = (categories: CategorySummary[], rootParentId: string | null): CategoryNode[] => {
	const nodesById = new Map<string, CategoryNode>();
	for (const category of categories) {
		nodesById.set(category.id, { ...category, children: [] });
	}

	const roots: CategoryNode[] = [];
	for (const category of categories) {
		const node = nodesById.get(category.id);
		if (!node) continue;

		if (category.parentId === rootParentId) {
			roots.push(node);
			continue;
		}

		// A child whose parent isn't in the set is skipped rather than promoted
		// to a root, so a filtered subtree query doesn't sprout phantom roots.
		if (category.parentId) {
			nodesById.get(category.parentId)?.children.push(node);
		}
	}

	return roots;
};
