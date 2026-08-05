import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const key = req.header("x-admin-key");
  if (!key || key !== env.adminKey) {
    return next(ApiError.unauthorized("Invalid admin key"));
  }
  next();
}
