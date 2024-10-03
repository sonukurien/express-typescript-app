import { Handler } from "../types";

export const home: Handler = (_req, res) => {
  res.send("Hello world");
};
