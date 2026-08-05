/**
 * OpenAPI route documentation.
 *
 * This file exists to keep `src/index.ts` focused on app wiring.
 * swagger-jsdoc loads docs from the `src` folder (see `src/swagger.ts`).
 */

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Backend is up and running
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Logged in successfully (HTTP-only cookie set)
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out and auth cookie cleared
 */

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Returns the current user
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /users/authors:
 *   get:
 *     summary: List all author accounts (ADMIN only)
 *     responses:
 *       200:
 *         description: List of users with the AUTHOR role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 */

/**
 * @openapi
 * /users/admins:
 *   post:
 *     summary: Create a new administrator (ADMIN only)
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Administrator created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 */

/**
 * @openapi
 * /users/admins/{id}:
 *   delete:
 *     summary: Delete a regular administrator account (SUPER_ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Administrator deleted
 *       400:
 *         description: Target is not a regular admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     summary: Change a user's role (ADMIN only; SUPER_ADMIN cannot be assigned or changed)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, AUTHOR]
 *             required:
 *               - role
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot change another administrator's role
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new author (ADMIN only)
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 */

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user (ADMIN only). SUPER_ADMIN cannot be assigned or changed.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, AUTHOR]
 *     responses:
 *       200:
 *         description: Author updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 *       404:
 *         description: Author not found
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete an author account only (ADMIN only; cannot delete self)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Author deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 *       404:
 *         description: Author not found
 */

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: List published posts (public, no auth)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug (not id). Only posts filed under this category are returned.
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Tag slug (not id). Only posts carrying this tag are returned.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: >
 *           Case-insensitive search over title and excerpt (not content).
 *           category, tag, and q are combined with AND when more than one is given.
 *     responses:
 *       200:
 *         description: >
 *           Paginated list of published posts (summary shape, no content field).
 *           Each post embeds categories: [{id, name, slug}] and tags: [{id, name, slug}].
 *       400:
 *         description: Invalid query parameters
 *   post:
 *     summary: Create a post (any authenticated role; always created as DRAFT)
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               isPinned:
 *                 type: boolean
 *               slug:
 *                 type: string
 *                 description: Optional. Auto-generated from title and de-duplicated if omitted.
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Optional. Every id must already exist, or the request fails with 400.
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Optional. Every id must already exist, or the request fails with 400.
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post created (status DRAFT)
 *       400:
 *         description: Invalid payload, or an unknown category/tag id
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Slug already in use
 */

/**
 * @openapi
 * /posts/{slug}:
 *   get:
 *     summary: Get a published post by slug (public, no auth)
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: >
 *           Full post detail (includes content), with categories: [{id, name, slug}]
 *           and tags: [{id, name, slug}] embedded.
 *       404:
 *         description: Post not found
 */

/**
 * @openapi
 * /posts/manage:
 *   get:
 *     summary: List posts of any status (own posts only for AUTHOR; all posts for ADMIN/SUPER_ADMIN)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *     responses:
 *       200:
 *         description: >
 *           Paginated list of posts, any status, including content and embedded
 *           categories/tags.
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid query parameters
 */

/**
 * @openapi
 * /posts/manage/{id}:
 *   get:
 *     summary: Get a single post by id, any status (own post only for AUTHOR)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Full post detail, with categories and tags embedded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot view another author's post
 *       404:
 *         description: Post not found
 *   patch:
 *     summary: Update, publish, or unpublish a post (own post only for AUTHOR)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               isPinned:
 *                 type: boolean
 *               slug:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *                 description: Setting PUBLISHED for the first time stamps publishedAt; later changes leave it untouched.
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: >
 *                   Replaces the post's full category list with exactly this set.
 *                   Omit the field to leave categories untouched; send [] to clear
 *                   them all. Every id must already exist, or the request fails with 400.
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: >
 *                   Replaces the post's full tag list with exactly this set.
 *                   Omit the field to leave tags untouched; send [] to clear them
 *                   all. Every id must already exist, or the request fails with 400.
 *     responses:
 *       200:
 *         description: Post updated
 *       400:
 *         description: Invalid payload, no fields to update, or an unknown category/tag id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot update another author's post
 *       404:
 *         description: Post not found
 *       409:
 *         description: Slug already in use
 *   delete:
 *     summary: Delete a post (own post only for AUTHOR)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot delete another author's post
 *       404:
 *         description: Post not found
 */

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List categories (public)
 *     description: >
 *       Returns a flat list by default, ordered by sortOrder then name.
 *       Pass tree=true to get nested nodes with a children array on each.
 *     parameters:
 *       - in: query
 *         name: tree
 *         schema:
 *           type: string
 *           enum: ["true", "false", "1", "0"]
 *         description: When true, returns nested nodes instead of a flat list.
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: >
 *           Flat mode - return only the direct children of this category.
 *           Tree mode - return the subtree hanging beneath it.
 *     responses:
 *       200:
 *         description: Categories returned
 *       400:
 *         description: Invalid query parameters
 *   post:
 *     summary: Create a category (ADMIN / SUPER_ADMIN only)
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Must be unique across all categories.
 *               slug:
 *                 type: string
 *                 description: >
 *                   Optional. Omit it and a unique slug is generated from the name.
 *                   Supply one and it must be free, or the request fails with 409.
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Omit or send null to create a top-level category.
 *               sortOrder:
 *                 type: integer
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Invalid payload, or parent category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ADMIN or SUPER_ADMIN
 *       409:
 *         description: Category name or slug already in use
 */

/**
 * @openapi
 * /categories/{slug}:
 *   get:
 *     summary: Get a single category by slug (public)
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Category returned
 *       404:
 *         description: Category not found
 */

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     summary: Update a category (ADMIN / SUPER_ADMIN only)
 *     description: >
 *       Reparenting is validated: a category cannot become its own parent,
 *       cannot be moved under one of its own descendants, and the target
 *       parent must exist. Send parentId as null to promote it to a root.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: >
 *           Invalid payload, no fields to update, parent not found,
 *           self-parenting, or a move that would create a cycle
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ADMIN or SUPER_ADMIN
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name or slug already in use
 *   delete:
 *     summary: Delete a category (ADMIN / SUPER_ADMIN only)
 *     description: >
 *       Refused with 409 while the category still has sub-categories - move or
 *       delete those first. Deleting a category that is only linked to posts is
 *       allowed: the links are removed, the posts themselves are untouched.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ADMIN or SUPER_ADMIN
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category still has sub-categories
 */

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: List tags (public)
 *     description: >
 *       Returns every tag, ordered by name, each with a postCount - the number
 *       of posts currently using it. Tags are a small flat set, so this is not
 *       paginated; sort by postCount client-side for a tag cloud.
 *     responses:
 *       200:
 *         description: Tags returned
 *   post:
 *     summary: Create a tag (any authenticated role)
 *     description: >
 *       Deliberately looser than categories - AUTHOR can create tags, since
 *       tags are content-level labels applied while writing.
 *     parameters:
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Must be unique across all tags.
 *               slug:
 *                 type: string
 *                 description: >
 *                   Optional. Omit it and a unique slug is generated from the name.
 *                   Supply one and it must be free, or the request fails with 409.
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Tag created
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Tag name or slug already in use
 */

/**
 * @openapi
 * /tags/{slug}:
 *   get:
 *     summary: Get a single tag by slug (public)
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Tag returned, including its postCount
 *       404:
 *         description: Tag not found
 */

/**
 * @openapi
 * /tags/{id}:
 *   patch:
 *     summary: Rename a tag or change its slug (any authenticated role)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 *       400:
 *         description: Invalid payload, or no fields to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 *       409:
 *         description: Tag name or slug already in use
 *   delete:
 *     summary: Delete a tag (any authenticated role)
 *     description: >
 *       Allowed even when posts are using the tag - unlike categories there is
 *       no subtree to lose. The post_tags links are removed and the posts
 *       themselves are untouched. Check postCount first if that matters.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - $ref: '#/components/parameters/CsrfHeader'
 *     responses:
 *       204:
 *         description: Tag deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
