import { Bucket } from "bucket";
import * as Koa from "koa";
import { errorHandler } from "middlewares/error_handler";
import { serviceRouter } from "middlewares/services_router";
import { Db, MongoClient } from "mongodb";

export interface AppContext extends Koa.DefaultContext {
  db: Db;
}

new Bucket()
  .init()
  .then(async (mongoClient: MongoClient) => {
    const app = new Koa<Koa.DefaultState, AppContext>();
    app.context.db = mongoClient.db(process.env.STORAGE_DB_NAME);
    app.use(errorHandler);
    app.use(serviceRouter.routes());
    app.use(serviceRouter.allowedMethods());

    app.listen(process.env.PORT, async () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
