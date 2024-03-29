import { Context, MiddlewareFn } from "telegraf"

export interface SessionStore<T> {
  get: (name: string) => T | undefined
  set: (name: string, value: T) => void
  delete: (name: string) => void
}

interface SessionOptions<S extends object> {
  getSessionKey?: (ctx: Context) => Promise<string | undefined>
  store?: SessionStore<S>
}

export interface SessionContext<S extends object> extends Context {
  session?: S
}

export function session<S extends object>(
  options?: SessionOptions<S>
): MiddlewareFn<SessionContext<S>> {
  const getSessionKey = options?.getSessionKey ?? defaultGetSessionKey
  const store = options?.store ?? new MemorySessionStore()
  return async (ctx, next) => {
    const key = await getSessionKey(ctx)
    if (key == null) {
      return await next()
    }
    ctx.session = await store.get(key)
    Object.defineProperty(ctx, 'session', {
      get() {
        return store.get(key)
      },
      set(value) {
        if (value === undefined) {
          store.delete(key)
        } else {
          store.set(key, value)
        }
      },
    })
    await next()
  }
}

async function defaultGetSessionKey(ctx: Context): Promise<string | undefined> {
  const fromId = ctx.from?.id
  const chatId = ctx.chat?.id
  if (fromId == null || chatId == null) {
    return undefined
  }
  return `${fromId}:${chatId}`
}

export class MemorySessionStore<T> implements SessionStore<T> {
  private readonly store = new Map<string, { session: T; expires: number }>()

  constructor(private readonly ttl = Infinity) {}

  get(name: string): T | undefined {
    const entry = this.store.get(name)
    if (entry == null) {
      return undefined
    } else if (entry.expires < Date.now()) {
      this.delete(name)
      return undefined
    }
    return entry.session
  }

  set(name: string, value: T): void {
    const now = Date.now()
    this.store.set(name, { session: value, expires: now + this.ttl })
  }

  delete(name: string): void {
    this.store.delete(name)
  }
}

export function isSessionContext<S extends object>(
  ctx: Context
): ctx is SessionContext<S> {
  return 'session' in ctx
}
