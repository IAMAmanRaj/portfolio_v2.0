import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { MediaService } from "./media.service";

const mediaService = new MediaService();

export class MediaController {
	getImageKitUploadAuth(_req: AuthenticatedRequest, res: Response) {
		const auth = mediaService.getImageKitUploadAuth();
		return res.status(200).json(auth);
	}
}
