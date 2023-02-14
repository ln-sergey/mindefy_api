import { session } from "./fixes/session";
import startScene from "./controllers/start";
import { Telegraf } from "telegraf";
import { Scenes } from "telegraf";
import { AppContext } from "./context";
import { getUserInfo } from "./middlewares/user-info";

const bot: Telegraf<AppContext> = new Telegraf(process.env.BOT_TOKEN as string);

const stage = new Scenes.Stage<Scenes.SceneContext>([startScene]);

bot.use(session());
bot.use(stage.middleware());
bot.use(getUserInfo);

bot.start((ctx) => ctx.scene.enter("start"));

bot.help((ctx) => {
  ctx.reply("Send /start to start training positive thinking");
  ctx.reply("Send /quit to stop training");
});

bot.launch();
console.log("started");
