import ImageKit from "@imagekit/nodejs";
import { env } from "../../config/env";

// One client for the process's lifetime — matches the Prisma singleton
// pattern in src/lib/db.ts.
const imagekit = new ImageKit({
	privateKey: env.imagekitPrivateKey,
});

export interface ImageKitUploadAuth {
	token: string;
	expire: number;
	signature: string;
	publicKey: string;
	urlEndpoint: string;
}

export class MediaService {
	// Generates short-lived, signed parameters so the client can upload
	// directly to ImageKit without this server ever touching the file body.
	// The private key never leaves the server; only the resulting signature does.
	getImageKitUploadAuth(): ImageKitUploadAuth {
		const { token, expire, signature } = imagekit.helper.getAuthenticationParameters();

		return {
			token,
			expire,
			signature,
			publicKey: env.imagekitPublicKey,
			urlEndpoint: env.imagekitUrlEndpoint,
		};
	}
}
