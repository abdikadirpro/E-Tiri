import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as usersService from "./users.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await usersService.listUsers(req.businessId!));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await usersService.createUser(req.businessId!, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await usersService.updateUser(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  res.json(await usersService.deactivateUser(req.businessId!, req.params.id));
});
