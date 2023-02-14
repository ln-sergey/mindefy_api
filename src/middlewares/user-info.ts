import { AppContext } from 'context';

/**
 * Modifies context and add some information about the user
 * @param ctx - telegram context
 * @param next - next function
 */
export const getUserInfo = async (ctx: AppContext, next: Function) => {
  if (!ctx.session.language) {
    ctx.session.language = 'en';
  }

  return next();
};
