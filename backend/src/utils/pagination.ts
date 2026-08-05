import { Request } from "express";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function buildDateRange(from?: unknown, to?: unknown) {
  const range: { gte?: Date; lte?: Date } = {};
  if (typeof from === "string" && from) range.gte = new Date(from);
  if (typeof to === "string" && to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }
  return Object.keys(range).length ? range : undefined;
}
