import * as Nats from "nats";
import * as Types from "types";
import { SubscriptionContext } from "./SubscriptionContext";

export class Client {
  private _connection: Nats.NatsConnection;

  private _subscriptions: Types.SubscribtionOptions[];

  private _handlers: Types.SubscribtionOptions[];

  constructor(private configuration: Types.Configuration) {}

  registerSubscribtion<IncomingPayload, OutcomingPayload>(
    options: Types.SubscribtionOptions<IncomingPayload, OutcomingPayload>
  ): this {
    this._subscriptions.push(options);
    return this;
  }

  registerHandler<IncomingPayload, OutcomingPayload>(
    options: Types.SubscribtionOptions<IncomingPayload, OutcomingPayload>
  ): this {
    this._handlers.push(options);
    return this;
  }

  async init(): Promise<void> {
    this._connection = await Nats.connect({
      servers: this.configuration.hostname,
      name: this.configuration.name,
    });

    for (const subscription of this._subscriptions) {
      this._connection.subscribe(subscription.topic, {
        callback: (err: Nats.NatsError | null, msg: Nats.Msg) =>
          subscription.middleware(new SubscriptionContext(msg.json())),
      });
    }

    for (const handler of this._handlers) {
      this._connection.subscribe(handler.topic, {
        callback: async (err: Nats.NatsError | null, msg: Nats.Msg) => {
          const context = new SubscriptionContext(msg.json());

          await handler.middleware(context);

          msg.respond(Nats.JSONCodec().encode(context.reply));
        },
      });
    }
  }

  publishMessage<IncomingPayload>(
    topic: string,
    payload: IncomingPayload
  ): void {
    this._connection.publish(
      topic,
      Nats.JSONCodec<IncomingPayload>().encode(payload)
    );
  }

  async request<IncomingPayload, OutcomingPayload>(
    topic: string,
    payload: IncomingPayload
  ): Promise<OutcomingPayload> {
    const response = await this._connection.request(
      topic,
      Nats.JSONCodec<IncomingPayload>().encode(payload),
      { timeout: 30000 }
    );

    return response.json();
  }
}
