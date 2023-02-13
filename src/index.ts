import { Context, Telegraf } from "telegraf";
import { Update } from "typegram";

const bot: Telegraf<Context<Update>> = new Telegraf(
  process.env.BOT_TOKEN as string
);

interface ChatState {
  stage: number;
  originalStatement?: string;
}

const chatIdToStage = new Map<number, ChatState>();

bot.start((ctx) => {
  ctx.reply("Please enter a negative statement about yourself.");
  chatIdToStage.set(ctx.chat.id, {
    stage: 0,
  });
});

bot.command("quit", (ctx) => {
  chatIdToStage.delete(ctx.chat.id);
});

bot.help((ctx) => {
  ctx.reply("Send /start to start training positive thinking");
  ctx.reply("Send /quit to stop training");
});

bot.on("text", (ctx) => {
  console.log(ctx.message.text);

  const chatState = chatIdToStage.get(ctx.chat.id);
  if (chatState?.stage == 0) {
    chatState.stage++;
    chatState.originalStatement = ctx.message.text;
    ctx.reply(
      `Please enter a statement disproving the original statement: "${ctx.message.text}"`
    );
  } else if (chatState?.stage == 1) {
    chatState.stage++;
    ctx.reply(
      "2 more statements left. Enter another statement disproving the original statement"
    );
  } else if (chatState?.stage == 2) {
    chatState.stage++;
    ctx.reply(
      "1 more statements left. Enter another statement disproving the original statement"
    );
  } else if (chatState?.stage == 3) {
    chatIdToStage.delete(ctx.chat.id);
    ctx.reply(
      "Congratulations! Now the statement doesn't seem so obvious anymore!\n" +
        "Train systematically and your thinking will become more optimistic and healthy!"
    );
  }
});

bot.launch();
