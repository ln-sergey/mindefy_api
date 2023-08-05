import * as KoaRouter from "koa-router";

export declare class Server {
  init(): Promise<void>;

  /** Must be used before `init` */
  register_route(
    path: string | RegExp,
    method: string,
    middleware: KoaRouter.IMiddleware
  ): this;
}
