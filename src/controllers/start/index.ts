import { Context } from "telegraf";
import { Scenes } from "telegraf";
import { ChatState } from "models/ChatState";
import { message } from "telegraf/filters";
import { AppContext } from "context";

const startScene = new Scenes.BaseScene<AppContext>("start");

const chatIdToStage = new Map<number, ChatState>();

startScene.enter(async (ctx) => {
  chatIdToStage.set(ctx.chat.id, {
    stage: 0,
  });
  await ctx.sendMessage("Please enter a negative statement about yourself. " + ctx.session.language);
});

startScene.on(message("text"), async (ctx) => {
  console.log(ctx.message.text);

  const chatState = chatIdToStage.get(ctx.chat.id);
  if (chatState?.stage == 0) {
    chatState.stage++;
    chatState.originalStatement = ctx.message.text;
    await ctx.sendMessage(
      `Please enter a statement disproving the original statement: "${ctx.message.text}"`
    );
  } else if (chatState?.stage == 1) {
    chatState.stage++;
    await ctx.sendMessage(
      "2 more statements left. Enter another statement disproving the original statement"
    );
  } else if (chatState?.stage == 2) {
    chatState.stage++;
    await ctx.sendMessage(
      "1 more statements left. Enter another statement disproving the original statement"
    );
  } else if (chatState?.stage == 3) {
    chatIdToStage.delete(ctx.chat.id);
    await ctx.sendMessage(
      "Congratulations! Now the statement doesn't seem so obvious anymore!\n" +
        "Train systematically and your thinking will become more optimistic and healthy!"
    );
    ctx.scene.leave()
  }
});

startScene.leave(async (ctx) => {
  chatIdToStage.delete(ctx.chat.id);
});

export default startScene;
