import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode = 500, code = "APP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    code: err.code || "SERVER ERROR",
    message: err.message || "Internal Server Error",
  });
}
