import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as adminService from "./admin.service";

export const createBusiness = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createBusiness(req.body));
});
