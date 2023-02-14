import { session } from "./fixes/session";
import startScene from "./controllers/start";
import { Telegraf } from "telegraf";
import { Scenes } from "telegraf";
import { AppContext } from "./context";
import { getUserInfo } from "./middlewares/user-info";
import { MongoClient } from "mongodb";

new MongoClient(
  `mongodb://${process.env.DB_USER}` +
    `:${process.env.DB_PASSWORD}@${process.env.DB_HOST}` +
    `:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`
)
  .connect()
  .then(async (mongoClient: MongoClient) => {
    const bot: Telegraf<AppContext> = new Telegraf(process.env.BOT_TOKEN);

    bot.context.dataBase = mongoClient.db(process.env.DB_NAME);

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
  })
  .catch((error) => {
    console.log(error);
  });
