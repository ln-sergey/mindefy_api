import * as Mongodb from "mongodb";
import * as Types from "types";

export class Client {
  private _client: Mongodb.MongoClient;
  private _collection: Mongodb.Collection;

  constructor(private configuration: Types.Configuration) {}

  async init(): Promise<void> {
    try {
      this._client = await Mongodb.MongoClient.connect(
        `mongodb://${this.configuration.username}` +
          `:${this.configuration.password}@${this.configuration.hostname}/?authSource=admin`
      );

      this._collection = await this.create_collection(this._client);
    } catch (error) {
      console.log(error);
    }
  }

  get collection(): Mongodb.Collection {
    return this._collection;
  }

  private async create_collection(
    client: Mongodb.MongoClient,
    options?: Mongodb.CreateCollectionOptions
  ): Promise<Mongodb.Collection> {
    try {
      const collection = await client
        .db(this.configuration.databaseName)
        .createCollection(this.configuration.collectionName, options);

      return collection;
    } catch (e) {
      return client
        .db(this.configuration.databaseName)
        .collection(this.configuration.collectionName);
    }
  }
}
