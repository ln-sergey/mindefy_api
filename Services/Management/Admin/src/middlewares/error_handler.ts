import { Context } from "koa";

export async function errorHandler(ctx: Context, next: () => Promise<any>) {
  try {
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = JSON.stringify({ error: "unknown_error" });
  }
}
