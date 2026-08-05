import { Request, Response } from "express";

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}
