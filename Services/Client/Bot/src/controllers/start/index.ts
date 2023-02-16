import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { AppContext } from "context";
import { Statement } from "models/Statement";
import * as Crypto from "crypto";

const startScene = new Scenes.BaseScene<AppContext>("start");

interface SceneSessionState {
  stage: number;
  maxStages: number;
  statementId?: string;
}

startScene.enter(async (ctx) => {
  await ctx.sendMessage(
    "Please enter a negative statement about yourself. " +
      ctx.session.user.language
  );
  ctx.scene.session.state = <SceneSessionState>{
    stage: 0,
    maxStages: 4,
  };
});

startScene.on(message("text"), async (ctx, next) => {
  const sceneSessionState = ctx.scene.session.state as SceneSessionState;
  sceneSessionState.stage++;
  if (!sceneSessionState.statementId) {
    const statement: Statement = {
      origin: ctx.message.text,
      user_id: ctx.session.user._id as any,
      created: Date.now(),
      challenges: [],
    };
    const id = Crypto.createHash("sha256")
      .update(JSON.stringify(statement))
      .digest("hex");
    await ctx.dataBase.collection<Statement>("statements").insertOne({
      _id: id as any,
      ...statement,
    });
    sceneSessionState.statementId = id;
    await ctx.sendMessage(
      `Please enter a statement disproving the original statement: "${ctx.message.text}"`
    );
    return;
  }
  await next();
});

startScene.on(message("text"), async (ctx) => {
  const sceneSessionState = ctx.scene.session.state as SceneSessionState;

  await ctx.dataBase.collection<Statement>("statements").updateMany(
    {
      _id: sceneSessionState.statementId as any,
    },
    {
      $push: { challenges: ctx.message.text },
    }
  );

  if (sceneSessionState.stage != sceneSessionState.maxStages) {
    await ctx.sendMessage(
      `${
        sceneSessionState.maxStages - sceneSessionState.stage
      } more statements left. Enter another statement disproving the original statement`
    );
  } else {
    await ctx.sendMessage(
      "Congratulations! Now the statement doesn't seem so obvious anymore!\n" +
        "Train systematically and your thinking will become more optimistic and healthy!"
    );
    ctx.scene.leave();
  }
});

startScene.leave(async (ctx) => {
  console.log(ctx.scene.state);
});

export default startScene;
