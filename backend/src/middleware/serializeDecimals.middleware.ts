import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

// Prisma's Decimal (used for every money field) serializes to JSON as a string by
// default, which silently breaks any client code/validation that expects a number.
// This walks every JSON response and converts Decimal instances to plain numbers
// so the API's actual wire format matches what the frontend types claim it is.
function toPlainNumbers(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  if (Array.isArray(value)) {
    return value.map(toPlainNumbers);
  }
  if (value instanceof Date) {
    return value;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toPlainNumbers(val);
    }
    return result;
  }
  return value;
}

export function serializeDecimalsMiddleware(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => originalJson(toPlainNumbers(body))) as typeof res.json;
  next();
}
