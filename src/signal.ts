import { ParamType } from './type';

type SignalCallback = (...args: any[]) => void;
export type Signals = Record<string, SignalCallback>;

type SignalMap<T extends Signals> = Partial<Record<keyof T, SignalCallback[]>>;

export class Signal<SIGNALS extends Signals> {
  private sigmap: SignalMap<SIGNALS> = {};

  public clear() {
    this.sigmap = {};
  }

  public connect<S extends keyof SIGNALS>(signal: S, handler: SIGNALS[S]) {
    const handlers = this.sigmap[signal];
    if (!handlers) {
      this.sigmap[signal] = [handler];
    } else {
      handlers.push(handler);
    }
  }

  public disconnect<S extends keyof SIGNALS>(signal: S, handler: SIGNALS[S]) {
    const handlers = this.sigmap[signal];
    if (!handlers) {
      return;
    }

    const index = handlers.findIndex((h) => h === (handler as any));
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      delete this.sigmap[signal];
    }
  }

  public emit<S extends keyof SIGNALS>(
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    const handlers = this.sigmap[signal];

    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const handler of handlers as SignalCallback[]) {
      handler(...args);
    }
  }

  public has(name: keyof SIGNALS): boolean {
    return name in this.sigmap;
  }
}
