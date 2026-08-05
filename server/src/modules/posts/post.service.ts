import { PostStatus } from "../../generated/prisma/client";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { PostRepository } from "./post.repository";
import { CreatePostInput, PostPublicFilters, UpdatePostInput } from "./post.types";

type Role = "SUPER_ADMIN" | "ADMIN" | "AUTHOR";

interface Actor {
	id: string;
	role: Role;
}

const postRepository = new PostRepository();

const canManageAny = (role: Role): boolean => role === "ADMIN" || role === "SUPER_ADMIN";

export class PostService {
	async listPublished(page: number, limit: number, filters: PostPublicFilters = {}) {
		const { posts, total } = await postRepository.findManyPublished(page, limit, filters);
		return { posts, page, limit, total };
	}

	async getPublishedBySlug(slug: string) {
		const post = await postRepository.findBySlugPublished(slug);
		if (!post) {
			throw new HttpError(404, "Post not found");
		}
		return post;
	}

	async listForManage(actor: Actor, page: number, limit: number, status?: PostStatus) {
		const authorId = canManageAny(actor.role) ? undefined : actor.id;
		const { posts, total } = await postRepository.findManyForManage(page, limit, status, authorId);
		return { posts, page, limit, total };
	}

	async getForManage(actor: Actor, id: string) {
		const post = await postRepository.findByIdForManage(id);
		if (!post) {
			throw new HttpError(404, "Post not found");
		}
		if (!canManageAny(actor.role) && post.author.id !== actor.id) {
			throw new HttpError(403, "Cannot view another author's post");
		}
		return post;
	}

	async create(actor: Actor, input: CreatePostInput) {
		// De-dupe once, up front, so the same array is used for both the
		// existence check and the write — no chance of them disagreeing.
		const categoryIds = input.categoryIds ? Array.from(new Set(input.categoryIds)) : undefined;
		const tagIds = input.tagIds ? Array.from(new Set(input.tagIds)) : undefined;
		await this.assertCategoryIdsExist(categoryIds);
		await this.assertTagIdsExist(tagIds);

		const baseSlug = input.slug ? input.slug : slugify(input.title);

		if (input.slug) {
			// User picked this slug explicitly — don't silently rewrite it.
			const taken = await postRepository.slugExists(input.slug);
			if (taken) {
				throw new HttpError(409, "Slug already in use");
			}
		}

		const slug = input.slug ? baseSlug : await this.dedupeSlug(baseSlug);

		return postRepository.create(
			{
				authorId: actor.id,
				slug,
				title: input.title,
				content: input.content,
				excerpt: input.excerpt,
				featuredImage: input.featuredImage,
				isPinned: input.isPinned,
			},
			categoryIds ?? [],
			tagIds ?? [],
		);
	}

	async update(actor: Actor, id: string, input: UpdatePostInput) {
		const existing = await postRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Post not found");
		}
		if (!canManageAny(actor.role) && existing.authorId !== actor.id) {
			throw new HttpError(403, "Cannot update another author's post");
		}

		if (input.slug && input.slug !== existing.slug) {
			const taken = await postRepository.slugExists(input.slug, id);
			if (taken) {
				throw new HttpError(409, "Slug already in use");
			}
		}

		// undefined stays undefined ("leave links alone"); a present array
		// (including []) is de-duped and validated before anything is written.
		const categoryIds = input.categoryIds ? Array.from(new Set(input.categoryIds)) : input.categoryIds;
		const tagIds = input.tagIds ? Array.from(new Set(input.tagIds)) : input.tagIds;
		await this.assertCategoryIdsExist(categoryIds);
		await this.assertTagIdsExist(tagIds);

		const { categoryIds: _categoryIds, tagIds: _tagIds, ...fields } = input;
		const patch: Omit<UpdatePostInput, "categoryIds" | "tagIds"> & { publishedAt?: Date } = {
			...fields,
		};

		// First transition into PUBLISHED stamps publishedAt. Later transitions
		// (including back to DRAFT) leave the original publishedAt untouched.
		if (input.status === PostStatus.PUBLISHED && !existing.publishedAt) {
			patch.publishedAt = new Date();
		}

		return postRepository.updateById(id, patch, categoryIds, tagIds);
	}

	async remove(actor: Actor, id: string) {
		const existing = await postRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Post not found");
		}
		if (!canManageAny(actor.role) && existing.authorId !== actor.id) {
			throw new HttpError(403, "Cannot delete another author's post");
		}
		await postRepository.deleteById(id);
	}

	// Rejects the whole request (400, naming the bad id) rather than silently
	// dropping an unknown category/tag id — a typo shouldn't make content
	// vanish from a post with no signal anything went wrong.
	private async assertCategoryIdsExist(ids: string[] | undefined) {
		if (!ids || ids.length === 0) return;
		const missing = await postRepository.findMissingCategoryIds(ids);
		if (missing.length > 0) {
			throw new HttpError(400, `Unknown category id(s): ${missing.join(", ")}`);
		}
	}

	private async assertTagIdsExist(ids: string[] | undefined) {
		if (!ids || ids.length === 0) return;
		const missing = await postRepository.findMissingTagIds(ids);
		if (missing.length > 0) {
			throw new HttpError(400, `Unknown tag id(s): ${missing.join(", ")}`);
		}
	}

	private async dedupeSlug(baseSlug: string): Promise<string> {
		let candidate = baseSlug;
		let suffix = 2;
		// Bounded loop — a real collision storm this deep would indicate a
		// different problem, so fail loudly rather than spin forever.
		while (await postRepository.slugExists(candidate)) {
			candidate = `${baseSlug}-${suffix}`;
			suffix += 1;
			if (suffix > 50) {
				throw new HttpError(500, "Could not generate a unique slug");
			}
		}
		return candidate;
	}
}
