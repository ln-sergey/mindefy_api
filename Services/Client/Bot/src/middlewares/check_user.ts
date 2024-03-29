import { AppContext } from "context";
import { User } from "models/User";
import { WithId } from "mongodb";

/**
 * Modifies context and add some information about the user
 * @param ctx - telegram context
 * @param next - next function
 */
export async function checkUser(ctx: AppContext, next: Function) {
  if (!ctx.session.user) {
    let user: WithId<User> = await ctx.dataBase
      .collection<User>("users")
      .findOne({ _id: ctx.from.id as any });
    if (!user) {
      user = {
        _id: ctx.from.id as any,
        created: Date.now(),
        username: ctx.from.username,
        name: `${ctx.from.first_name} ${ctx.from.last_name}`,
        lastActivity: Date.now(),
        language: ctx.from.language_code,
      };

      await ctx.dataBase.collection<User>("users").insertOne(user);
    }
    ctx.session.user = user;
  }
  return next();
}
