import {
  ChangeStreamDocument,
  Collection,
  CreateCollectionOptions,
  MongoClient,
  Document
} from "mongodb";

export abstract class BucketConsumer<T extends Document> {
  abstract execute(ctx: ChangeStreamDocument<T>): Promise<void>;
}

export interface Watch<T extends Document> {
  middleware: BucketConsumer<T>;
  filter?: Document;
}

export class Bucket {
  protected watchers: Watch<any>[];
  protected client: MongoClient;

  constructor(
    protected databaseName?: string,
    protected collectionName?: string
  ) {
    this.databaseName ??= process.env.STORAGE_DB_NAME;
    this.databaseName ??= process.env.STORAGE_COLLECTION_NAME;
  }

  watch<T>(options: Watch<T>): this {
    this.watchers.push(options);

    return this;
  }

  async init(): Promise<MongoClient> {
    try {
      this.client = await MongoClient.connect(
        `mongodb://${process.env.STORAGE_USERNAME}` +
          `:${process.env.STORAGE_PASSWORD}@${process.env.STORAGE_HOSTNAME}/?authSource=admin`
      );
      for (const watcher of this.watchers) {
        await this.consume(watcher);
      }
      return this.client;
    } catch (error) {
      console.log(error);
    }
  }

  private async consume<T>(options: Watch<T>): Promise<void> {
    const collection = await this.create_collection(this.client, {
      changeStreamPreAndPostImages: {
        enabled: true,
      },
    });

    const pipeline = options.filter ? [options.filter] : [];

    collection
      .watch(pipeline, {
        fullDocument: "updateLookup",
        fullDocumentBeforeChange: "required",
      })
      .on("change", async (change) => {
        await options.middleware.execute(change as ChangeStreamDocument<T>);
      });
  }

  private async create_collection<T>(
    client: MongoClient,
    options?: CreateCollectionOptions
  ): Promise<Collection<T>> {
    try {
      const collection = await client
        .db(this.databaseName)
        .createCollection<T>(this.collectionName, options);

      return collection;
    } catch (e) {
      return client.db(this.databaseName).collection<T>(this.collectionName);
    }
  }
}
