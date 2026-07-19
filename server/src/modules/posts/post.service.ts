import { PostStatus } from "../../generated/prisma/client";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { PostRepository } from "./post.repository";
import { CreatePostInput, UpdatePostInput } from "./post.types";

type Role = "SUPER_ADMIN" | "ADMIN" | "AUTHOR";

interface Actor {
	id: string;
	role: Role;
}

const postRepository = new PostRepository();

const canManageAny = (role: Role): boolean => role === "ADMIN" || role === "SUPER_ADMIN";

export class PostService {
	async listPublished(page: number, limit: number) {
		const { posts, total } = await postRepository.findManyPublished(page, limit);
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
		const baseSlug = input.slug ? input.slug : slugify(input.title);

		if (input.slug) {
			// User picked this slug explicitly — don't silently rewrite it.
			const taken = await postRepository.slugExists(input.slug);
			if (taken) {
				throw new HttpError(409, "Slug already in use");
			}
		}

		const slug = input.slug ? baseSlug : await this.dedupeSlug(baseSlug);

		return postRepository.create({
			...input,
			authorId: actor.id,
			slug,
		});
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

		const patch: UpdatePostInput & { publishedAt?: Date } = { ...input };

		// First transition into PUBLISHED stamps publishedAt. Later transitions
		// (including back to DRAFT) leave the original publishedAt untouched.
		if (input.status === PostStatus.PUBLISHED && !existing.publishedAt) {
			patch.publishedAt = new Date();
		}

		return postRepository.updateById(id, patch);
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
