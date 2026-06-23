import type { Request, Response, NextFunction } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  const { default: app } = await import("../artifacts/api-server/src/app");
  return app(req, res, next);
};
