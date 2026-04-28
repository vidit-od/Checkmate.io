import { Hono } from "hono";
import { Health } from "./health";

export const IndexRouter = new Hono();

IndexRouter.route('/health', Health);
