import express from "express";
import { routes } from "./routes";

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }))

routes.forEach((route) => {
  const { method, path, middleware, handler } = route;
  app[method](path, ...middleware, handler);
});

app.listen(PORT, () => {
  console.log(`Express Typescript app @ http://localhost:${PORT}`);
});
