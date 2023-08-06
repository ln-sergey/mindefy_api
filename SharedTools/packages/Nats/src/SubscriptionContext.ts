import * as Types from "Types";

export class SubscriptionContext<IncomingPayload, OutcomingPayload>
  implements Types.SubscribtionContext<IncomingPayload, OutcomingPayload>
{
  private _message: IncomingPayload;
  private _reply: OutcomingPayload;

  constructor(message: IncomingPayload) {
    this._message = message;
  }

  get message(): IncomingPayload {
    return this._message;
  }

  get reply(): OutcomingPayload {
    return this._reply;
  }

  set reply(payload: OutcomingPayload) {}
}
