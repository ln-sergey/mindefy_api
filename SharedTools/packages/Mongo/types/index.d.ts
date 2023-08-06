import * as Mongodb from "mongodb";

export interface Configuration {
  hostname: string;
  username: string;
  password: string;
  databaseName: string;
  collectionName: string;
}

export declare class Client {
  constructor(configuration: Configuration);

  init(): Promise<void>;

  get collection(): Mongodb.Collection;
}
