import { Prisma, PostStatus } from "../../generated/prisma/client";
import db from "../../lib/db";
import { TaxonomyRef, UpdatePostInput } from "./post.types";

const authorSummarySelect = {
	id: true,
	displayName: true,
	avatarUrl: true,
} as const;

// Embeds the linked categories/tags as full {id, name, slug} objects via the
// join tables, so a post response never forces a second request just to
// render its labels. Flattened out of Prisma's nested shape by
// flattenTaxonomies below before anything leaves this file.
const taxonomySelect = {
	postCategories: {
		select: { category: { select: { id: true, name: true, slug: true } } },
	},
	postTags: {
		select: { tag: { select: { id: true, name: true, slug: true } } },
	},
} as const;

export const postListSelect = {
	id: true,
	title: true,
	slug: true,
	excerpt: true,
	featuredImage: true,
	status: true,
	isPinned: true,
	publishedAt: true,
	createdAt: true,
	updatedAt: true,
	author: { select: authorSummarySelect },
	...taxonomySelect,
} as const;

export const postDetailSelect = {
	...postListSelect,
	content: true,
} as const;

type RawPostListRow = Prisma.PostGetPayload<{ select: typeof postListSelect }>;
type RawPostDetailRow = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

// Prisma's join-table shape (postCategories: [{category: {...}}]) is an ORM
// detail. Flatten it here so it never reaches a client and the response
// shape (categories: [...], tags: [...]) stays ours to change.
const flattenTaxonomies = <T extends { postCategories: { category: TaxonomyRef }[]; postTags: { tag: TaxonomyRef }[] }>(
	row: T,
) => {
	const { postCategories, postTags, ...rest } = row;
	return {
		...rest,
		categories: postCategories.map((pc) => pc.category),
		tags: postTags.map((pt) => pt.tag),
	};
};

interface CreatePostData {
	authorId: string;
	slug: string;
	title: string;
	content: string;
	excerpt?: string;
	featuredImage?: string;
	isPinned?: boolean;
}

// De-dupes an id array. A duplicate in a client payload would otherwise
// violate the @@unique([postId, categoryId]) constraint on createMany and
// surface as an opaque 500 instead of just being harmlessly ignored.
const dedupe = (ids: string[]): string[] => Array.from(new Set(ids));

export class PostRepository {
	async findManyPublished(page: number, limit: number) {
		const where: Prisma.PostWhereInput = { status: PostStatus.PUBLISHED };

		const [posts, total] = await Promise.all([
			db.post.findMany({
				where,
				select: postListSelect,
				orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
				skip: (page - 1) * limit,
				take: limit,
			}),
			db.post.count({ where }),
		]);

		return { posts: posts.map((p: RawPostListRow) => flattenTaxonomies(p)), total };
	}

	async findBySlugPublished(slug: string) {
		const post = await db.post.findFirst({
			where: { slug, status: PostStatus.PUBLISHED },
			select: postDetailSelect,
		});
		return post ? flattenTaxonomies(post as RawPostDetailRow) : null;
	}

	async findManyForManage(page: number, limit: number, status?: PostStatus, authorId?: string) {
		const where: Prisma.PostWhereInput = {
			...(status ? { status } : {}),
			...(authorId ? { authorId } : {}),
		};

		const [posts, total] = await Promise.all([
			db.post.findMany({
				where,
				select: postDetailSelect,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			db.post.count({ where }),
		]);

		return { posts: posts.map((p: RawPostDetailRow) => flattenTaxonomies(p)), total };
	}

	async findByIdForManage(id: string) {
		const post = await db.post.findUnique({
			where: { id },
			select: postDetailSelect,
		});
		return post ? flattenTaxonomies(post as RawPostDetailRow) : null;
	}

	// Raw row (no select projection, no taxonomy join) — used internally for
	// ownership/state checks that only need authorId/slug/publishedAt.
	findRawById(id: string) {
		return db.post.findUnique({ where: { id } });
	}

	async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const existing = await db.post.findUnique({ where: { slug }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	// Returns just the ids from the input that do NOT exist, so the service
	// can reject the whole write with a 400 naming the bad id(s) rather than
	// silently dropping them.
	async findMissingCategoryIds(ids: string[]): Promise<string[]> {
		if (ids.length === 0) return [];
		const found = await db.category.findMany({ where: { id: { in: ids } }, select: { id: true } });
		const foundIds = new Set(found.map((c) => c.id));
		return ids.filter((id) => !foundIds.has(id));
	}

	async findMissingTagIds(ids: string[]): Promise<string[]> {
		if (ids.length === 0) return [];
		const found = await db.tag.findMany({ where: { id: { in: ids } }, select: { id: true } });
		const foundIds = new Set(found.map((t) => t.id));
		return ids.filter((id) => !foundIds.has(id));
	}

	async create(data: CreatePostData, categoryIds: string[], tagIds: string[]) {
		const created = await db.$transaction(async (tx) => {
			const post = await tx.post.create({
				data: {
					authorId: data.authorId,
					title: data.title,
					slug: data.slug,
					content: data.content,
					excerpt: data.excerpt,
					featuredImage: data.featuredImage,
					isPinned: data.isPinned ?? false,
				},
			});

			const categories = dedupe(categoryIds);
			if (categories.length > 0) {
				await tx.postCategory.createMany({
					data: categories.map((categoryId) => ({ postId: post.id, categoryId })),
				});
			}

			const tags = dedupe(tagIds);
			if (tags.length > 0) {
				await tx.postTag.createMany({ data: tags.map((tagId) => ({ postId: post.id, tagId })) });
			}

			return tx.post.findUniqueOrThrow({ where: { id: post.id }, select: postDetailSelect });
		});

		return flattenTaxonomies(created as RawPostDetailRow);
	}

	async updateById(
		id: string,
		data: Omit<UpdatePostInput, "categoryIds" | "tagIds"> & { publishedAt?: Date },
		categoryIds?: string[],
		tagIds?: string[],
	) {
		// undefined means "don't touch the links" — skip the transaction
		// entirely and do a plain update when neither array was sent.
		if (categoryIds === undefined && tagIds === undefined) {
			const updated = await db.post.update({ where: { id }, data, select: postDetailSelect });
			return flattenTaxonomies(updated as RawPostDetailRow);
		}

		const updated = await db.$transaction(async (tx) => {
			await tx.post.update({ where: { id }, data });

			if (categoryIds !== undefined) {
				await tx.postCategory.deleteMany({ where: { postId: id } });
				const categories = dedupe(categoryIds);
				if (categories.length > 0) {
					await tx.postCategory.createMany({
						data: categories.map((categoryId) => ({ postId: id, categoryId })),
					});
				}
			}

			if (tagIds !== undefined) {
				await tx.postTag.deleteMany({ where: { postId: id } });
				const tags = dedupe(tagIds);
				if (tags.length > 0) {
					await tx.postTag.createMany({ data: tags.map((tagId) => ({ postId: id, tagId })) });
				}
			}

			return tx.post.findUniqueOrThrow({ where: { id }, select: postDetailSelect });
		});

		return flattenTaxonomies(updated as RawPostDetailRow);
	}

	deleteById(id: string) {
		return db.post.delete({ where: { id } });
	}
}
