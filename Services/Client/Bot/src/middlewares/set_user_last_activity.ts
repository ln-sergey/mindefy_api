import { AppContext } from "context";
import { User } from "models/User";
import { WithId } from "mongodb";

/**
 * Updates User.lastActivity with current time
 * @param ctx - telegram context
 * @param next - next function
 */
export async function checkUser(ctx: AppContext, next: Function) {
  await ctx.dataBase.collection<User>("users").updateOne(
    { _id: ctx.from.id as any },
    {
      $set: {
        lastActivity: Date.now(),
      },
    }
  );
  return next();
}
