import { RequestHandler as Middleware } from "express";

export const requestLogger: Middleware = (req, _res, next) => {
  console.log(req.path);
  next();
};
