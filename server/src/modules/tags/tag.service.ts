import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { TagRepository } from "./tag.repository";
import { CreateTagInput, UpdateTagInput } from "./tag.types";

const tagRepository = new TagRepository();

export class TagService {
	async list() {
		const tags = await tagRepository.findMany();
		return { tags };
	}

	async getBySlug(slug: string) {
		const tag = await tagRepository.findBySlug(slug);
		if (!tag) {
			throw new HttpError(404, "Tag not found");
		}
		return tag;
	}

	async create(input: CreateTagInput) {
		const nameTaken = await tagRepository.nameExists(input.name);
		if (nameTaken) {
			throw new HttpError(409, "Tag name already in use");
		}

		const slug = await this.resolveSlug(input.slug, input.name);

		return tagRepository.create({ ...input, slug });
	}

	async update(id: string, input: UpdateTagInput) {
		const existing = await tagRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Tag not found");
		}

		if (input.name && input.name !== existing.name) {
			const nameTaken = await tagRepository.nameExists(input.name, id);
			if (nameTaken) {
				throw new HttpError(409, "Tag name already in use");
			}
		}

		if (input.slug && input.slug !== existing.slug) {
			const slugTaken = await tagRepository.slugExists(input.slug, id);
			if (slugTaken) {
				throw new HttpError(409, "Slug already in use");
			}
		}

		return tagRepository.updateById(id, input);
	}

	async remove(id: string) {
		const existing = await tagRepository.findRawById(id);
		if (!existing) {
			throw new HttpError(404, "Tag not found");
		}

		// Unguarded on purpose. Unlike categories there is no subtree to lose:
		// the post_tags rows cascade away and the posts themselves are untouched.
		// postCount on the list response is what gives visibility before deleting.
		await tagRepository.deleteById(id);
	}

	private async resolveSlug(requested: string | undefined, name: string): Promise<string> {
		if (requested) {
			// Explicitly chosen — don't silently rewrite it.
			const taken = await tagRepository.slugExists(requested);
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
		while (await tagRepository.slugExists(candidate)) {
			candidate = `${baseSlug}-${suffix}`;
			suffix += 1;
			if (suffix > 50) {
				throw new HttpError(500, "Could not generate a unique slug");
			}
		}
		return candidate;
	}
}
