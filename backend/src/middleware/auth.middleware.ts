import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import { ApiError } from "../utils/ApiError";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return next(ApiError.unauthorized("Login is required"));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, businessId: payload.businessId };
    req.businessId = payload.businessId;
    next();
  } catch {
    next(ApiError.unauthorized("Session expired, please log in again"));
  }
}
