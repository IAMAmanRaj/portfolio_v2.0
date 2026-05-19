import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const errorMiddleware = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error(err);

	if (res.headersSent) {
		return;
	}

	if (err instanceof HttpError) {
		return res.status(err.statusCode).json({ message: err.message });
	}

	return res.status(500).json({
		message: "Internal server error",
	});
};

