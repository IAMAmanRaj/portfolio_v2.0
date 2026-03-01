import cors, { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
	origin: env.clientOrigin,
	credentials: true,
};

export const corsMiddleware = cors(corsOptions);

