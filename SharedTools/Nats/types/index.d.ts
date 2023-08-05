export interface Configuration {
  hostname: string;
  name: string;
}

export interface SubscribtionOptions<
  IncomingPayload = unknown,
  OutcomingPayload = unknown
> {
  topic: string;

  middleware: (
    context: SubscribtionContext<IncomingPayload, OutcomingPayload>
  ) => Promise<void>;
}

export interface SubscribtionContext<IncomingPayload, OutcomingPayload> {
  get message(): IncomingPayload;

  set reply(payload: OutcomingPayload);
}

export declare class Client {
  init(): Promise<void>;

  constructor(configuration: Configuration);

  /** Must be used before `init` */
  registerSubscribtion<IncomingPayload, OutcomingPayload>(
    options: SubscribtionOptions<IncomingPayload, OutcomingPayload>
  ): this;

  /** Must be used before `init` */
  registerHandler<IncomingPayload, OutcomingPayload>(
    options: SubscribtionOptions<IncomingPayload, OutcomingPayload>
  ): this;

  /** Must be used after `init` */
  publishMessage<IncomingPayload>(
    topic: string,
    payload: IncomingPayload
  ): void;

  /** Must be used after `init` */
  request<IncomingPayload, OutcomingPayload>(
    topic: string,
    payload: IncomingPayload
  ): Promise<OutcomingPayload>;
}
