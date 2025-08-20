// api/server.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/index";

export default (req: VercelRequest, res: VercelResponse) => {
  app(req as any, res as any);
};
