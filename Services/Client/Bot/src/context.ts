import { User } from "./models/User";
import { Db, WithId } from "mongodb";
import { Context, Scenes } from "telegraf";

export interface AppContext extends Context {
  dataBase: Db;
  session: AppSession;
  scene: Scenes.SceneContextScene<AppContext>;
}

export interface AppSession extends Scenes.SceneSession {
  user: WithId<User>;
}
