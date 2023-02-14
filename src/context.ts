import { Context, Scenes } from "telegraf";

export interface AppContext extends Context {
  session: AppSession;
  scene: Scenes.SceneContextScene<AppContext>;
}

export interface AppSession extends Scenes.SceneSession {
  language: 'en' | 'ru';
}
