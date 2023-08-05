import objectHash from "object-hash";
import { Context } from "koa";
import { Db, WithId } from "mongodb";
import { NotFoundError } from "../errors";
import { IUser } from "../schemas/user.schema";
import { IUserUpdate } from "../schemas/user.update.schema";

class ServiceController {
  private static COLLECTION_NAME = process.env.COLLECTION_NAME as string;

  static async create(ctx: Context, next: () => Promise<any>) {
    const id = objectHash(ctx.request.body as IUser);
    const model: WithId<IUser> = {
      _id: id,
      ...ctx.request.body,
    };
    await (ctx.db as Db)
      .collection(this.COLLECTION_NAME)
      .insertOne(model as object);
    ctx.body = model;
    ctx.status = 200;
    await next();
  }

  static async getOne(ctx: Context) {
    const user = await (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .findOne({ _id: ctx.params.id });
    if (!user) {
      throw new NotFoundError("account_not_found");
    } else {
      ctx.status = 200;
      ctx.body = user;
    }
  }

  static async paginate(ctx: Context) {
    const { limit, offset, status } = ctx.query;
    const usersCount = await (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .count(status ? { status } : {});
    const users = await (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .find(status ? { status } : {})
      .skip(Number(offset))
      .limit(Number(limit))
      .toArray();
    ctx.status = 200;
    ctx.body = { total: usersCount, items: users };
  }

  static async stats(ctx: Context) {
    const { city } = ctx.query;
    const statsCursor = (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .aggregate([
        { $unset: ["name", "email"] },
        { $match: !city ? {} : { city: { $in: (city as string).split(",") } } },
        {
          $group: {
            _id: "$city",
            premium: {
              $sum: {
                $cond: [{ $eq: ["$status", "premium"] }, 1, 0],
              },
            },
            regular: {
              $sum: {
                $cond: [{ $eq: ["$status", "regular"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            city: "$_id",
            premium: "$premium",
            regular: "$regular",
          },
        },
      ]);

    ctx.body = await statsCursor.toArray();
    ctx.status = 200;
  }

  static async update(ctx: Context, next: () => Promise<any>) {
    const result = await (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: ctx.params.id },
        { $set: ctx.request.body as IUserUpdate },
        { returnDocument: "after" }
      );
    if (!result) {
      throw new NotFoundError("account_not_found");
    } else {
      ctx.status = 200;
      ctx.body = result.value;
      await next();
    }
  }

  static async delete(ctx: Context, next: () => Promise<any>) {
    const result = await (ctx.db as Db)
      .collection<IUser>(this.COLLECTION_NAME)
      .deleteOne({ _id: ctx.params.id });
    if (!result.deletedCount) {
      throw new NotFoundError("account_not_found");
    } else {
      ctx.status = 200;
      ctx.body = { _id: ctx.params.id };
      await next();
    }
  }
}

export default ServiceController;
