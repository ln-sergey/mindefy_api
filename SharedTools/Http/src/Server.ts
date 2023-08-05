import * as Koa from "koa";
import * as KoaRouter from "koa-router";

export class Server {
  private _server = new Koa();
  private _router = new KoaRouter();

  async init(): Promise<void> {
    this._server.use(this._router.routes());

    this._server.listen(80);
  }

  register_route(
    path: string | RegExp,
    method: string,
    middleware: KoaRouter.IMiddleware
  ): this {
    this._router.register(path, [method], middleware);
    return this;
  }
}
