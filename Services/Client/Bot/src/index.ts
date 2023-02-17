import { session } from "./fixes/session";
import startScene from "./controllers/start";
import { Telegraf } from "telegraf";
import { Scenes } from "telegraf";
import { AppContext } from "./context";
import { checkUser } from "./middlewares/check_user";
import { MongoClient } from "mongodb";


new MongoClient(
  `mongodb://${process.env.STORAGE_USERNAME}` +
    `:${process.env.STORAGE_PASSWORD}@${process.env.STORAGE_HOSTNAME}/?authSource=admin`
)
  .connect()
  .then(async (mongoClient: MongoClient) => {
    const bot: Telegraf<AppContext> = new Telegraf(process.env.BOT_TOKEN);

    bot.context.dataBase = mongoClient.db(process.env.STORAGE_DB_NAME);

    const stage = new Scenes.Stage<Scenes.SceneContext>([startScene]);

    bot.use(session());
    bot.use(stage.middleware());
    bot.use(checkUser);

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
