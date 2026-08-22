import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { env } from "../../config/env";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { token, user, business } = await authService.signup(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user, business });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, user, business } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.json({ user, business });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.getMe(req.user!.id);
  res.json(data);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.status(204).send();
});
