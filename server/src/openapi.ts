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
 *     summary: Delete an administrator account (ADMIN only; cannot delete self)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Administrator deleted
 *       400:
 *         description: Cannot delete own account or target is not an admin
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
 *     summary: Change a user's role (ADMIN only; cannot change another admin's role)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
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
 *     summary: Update a user (ADMIN only). Role changes are not allowed for other administrators unless you are that user.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
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
