import KoaBody from "koa-body";
import * as Router from "koa-router";
import * as Convert from "koa-convert";
import ServiceController from "controllers/service_controller";
import { AppContext } from "index";

const koaBody = Convert(KoaBody());

export const serviceRouter = new Router()
  .post("/", koaBody)
  .get(
    "/paginate",
    addContentType("application/json"),
    ServiceController.paginate.bind(ServiceController)
  )
  .get(
    "/:id",
    addContentType("application/json"),
    ServiceController.getOne.bind(ServiceController)
  )
  .put(
    "/:id",
    koaBody,
    addContentType("application/json"),
    ServiceController.update.bind(ServiceController)
  )
  .delete(
    "/:id",
    addContentType("application/json"),
    ServiceController.delete.bind(ServiceController)
  );

function addContentType(contentType: string) {
  return async (ctx: AppContext, next: () => Promise<any>) => {
    ctx.type = contentType;
    await next();
  };
}
