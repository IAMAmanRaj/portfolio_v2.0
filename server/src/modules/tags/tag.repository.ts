import db from "../../lib/db";
import { CreateTagInput, TagSummary, UpdateTagInput } from "./tag.types";

// _count asks Postgres to count the related post_tags rows in the same query,
// so the list endpoint stays one round trip rather than one per tag.
const tagSelect = {
	id: true,
	name: true,
	slug: true,
	createdAt: true,
	_count: { select: { postTags: true } },
} as const;

interface TagRow {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	_count: { postTags: number };
}

// Prisma's nested `_count` is an ORM detail. Flatten it here so it never
// reaches a client and the response shape stays ours to change.
const toSummary = (tag: TagRow): TagSummary => ({
	id: tag.id,
	name: tag.name,
	slug: tag.slug,
	createdAt: tag.createdAt,
	postCount: tag._count.postTags,
});

interface CreateTagData extends CreateTagInput {
	slug: string;
}

export class TagRepository {
	async findMany(): Promise<TagSummary[]> {
		// Tags are a small, flat set, so this returns all of them. Clients can
		// sort by postCount client-side since the count is in the payload.
		const tags = await db.tag.findMany({
			select: tagSelect,
			orderBy: { name: "asc" },
		});
		return tags.map(toSummary);
	}

	async findBySlug(slug: string): Promise<TagSummary | null> {
		const tag = await db.tag.findUnique({ where: { slug }, select: tagSelect });
		return tag ? toSummary(tag) : null;
	}

	// Raw row (no select projection) — used internally for existence checks.
	findRawById(id: string) {
		return db.tag.findUnique({ where: { id } });
	}

	async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const existing = await db.tag.findUnique({ where: { slug }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	async nameExists(name: string, excludeId?: string): Promise<boolean> {
		const existing = await db.tag.findUnique({ where: { name }, select: { id: true } });
		if (!existing) return false;
		return existing.id !== excludeId;
	}

	async create(data: CreateTagData): Promise<TagSummary> {
		const tag = await db.tag.create({
			data: { name: data.name, slug: data.slug },
			select: tagSelect,
		});
		return toSummary(tag);
	}

	async updateById(id: string, data: UpdateTagInput): Promise<TagSummary> {
		const tag = await db.tag.update({ where: { id }, data, select: tagSelect });
		return toSummary(tag);
	}

	deleteById(id: string) {
		return db.tag.delete({ where: { id } });
	}
}
