import { Prisma, PostStatus } from "../../generated/prisma/client";
import db from "../../lib/db";
import { CreatePostInput, UpdatePostInput } from "./post.types";

const authorSummarySelect = {
	id: true,
	displayName: true,
	avatarUrl: true,
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
} as const;

export const postDetailSelect = {
	...postListSelect,
	content: true,
} as const;

interface CreatePostData extends CreatePostInput {
	authorId: string;
	slug: string;
}

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

		return { posts, total };
	}

	findBySlugPublished(slug: string) {
		return db.post.findFirst({
			where: { slug, status: PostStatus.PUBLISHED },
			select: postDetailSelect,
		});
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

		return { posts, total };
	}

	findByIdForManage(id: string) {
		return db.post.findUnique({
			where: { id },
			select: postDetailSelect,
		});
	}

	// Raw row (no select projection) — used internally for ownership/state checks.
	findRawById(id: string) {
		return db.post.findUnique({ where: { id } });
	}

	async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const existing = await db.post.findUnique({ where: { slug }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	create(data: CreatePostData) {
		return db.post.create({
			data: {
				authorId: data.authorId,
				title: data.title,
				slug: data.slug,
				content: data.content,
				excerpt: data.excerpt,
				featuredImage: data.featuredImage,
				isPinned: data.isPinned ?? false,
			},
			select: postDetailSelect,
		});
	}

	updateById(id: string, data: UpdatePostInput & { publishedAt?: Date }) {
		return db.post.update({
			where: { id },
			data,
			select: postDetailSelect,
		});
	}

	deleteById(id: string) {
		return db.post.delete({ where: { id } });
	}
}
