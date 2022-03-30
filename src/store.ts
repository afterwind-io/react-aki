import { BitMask } from "./bitmask";
import {
  buildAggregatorsApi,
  buildMutatorsApi,
  simpleDeepClone,
} from "./helper";
import { Signal, Signals } from "./signal";
import { AkiAggregator, AkiBatchExecutor, AkiMutator } from "./type";

interface AkiStoreSignals<T> extends Signals {
  update(mask: BitMask): void;
  watch(key: keyof T, value: any): void;
}

export class AkiStore<T, M, A> {
  public readonly store: T;
  public readonly mutators: M;
  public readonly aggregators: A;

  private readonly _mutators: AkiMutator<T, M>;
  private readonly _aggregators: AkiAggregator<T, M, A>;

  private readonly signal: Signal<AkiStoreSignals<T>> = new Signal();
  private readonly signalMaskBits: Partial<Record<keyof T, BitMask>> = {};
  private signalMaskBitPointer: number = 0;

  public constructor(
    store: T,
    mutators: AkiMutator<T, M>,
    aggregators?: AkiAggregator<T, M, A>
  ) {
    this.store = store;

    this.batch = this.batch.bind(this);
    this.mutate = this.mutate.bind(this);

    this._mutators = mutators;
    this.mutators = buildMutatorsApi(this._mutators, this.store, this.mutate);

    this._aggregators = aggregators || ({} as AkiAggregator<T, M, A>);
    this.aggregators = buildAggregatorsApi(
      this._aggregators,
      this.store,
      this.mutate,
      this.mutators,
      this.batch
    );
  }

  public async batch(
    executor: AkiBatchExecutor<T, M, A>,
    pool: Partial<T> = {}
  ) {
    const collectiveMutate = (values: Partial<T>) => {
      // FIXME 与下方的this.mutate会重复设置值
      Object.assign(this.store, values);

      Object.assign(pool, values);
    };

    const batchMutators = buildMutatorsApi(
      this._mutators,
      this.store,
      collectiveMutate
    );
    const batchAggregators = buildAggregatorsApi(
      this._aggregators,
      this.store,
      collectiveMutate,
      batchMutators,
      (executor) => this.batch(executor, pool)
    );

    await Promise.resolve(
      executor({
        batchMutate: collectiveMutate,
        batchMutators,
        batchAggregators,
      })
    );

    this.mutate(pool);
  }

  public clone(): AkiStore<T, M, A> {
    const storeClone = simpleDeepClone(this.store);
    return new AkiStore(storeClone, this._mutators, this._aggregators);
  }

  public register = (keys: (keyof T)[], update: () => void) => {
    let _mask = BitMask.FromBitIndex(0);

    for (const key of keys) {
      const maskBit = this.getMaskBitByKey(key);
      _mask = _mask.merge(maskBit);
    }

    const updateHandler = (mask: BitMask) => {
      if (_mask.test(mask)) {
        update();
      }
    };
    this.signal.connect("update", updateHandler);

    return () => this.signal.disconnect("update", updateHandler);
  };

  public mutate(values: Partial<T>): void {
    let mask = BitMask.FromBitIndex(0);
    for (const key of Object.keys(values) as (keyof T)[]) {
      const maskBit = this.getMaskBitByKey(key);

      mask = mask.merge(maskBit!);

      const value = values[key];
      this.store[key] = value!;

      this.signal.emit("watch", key, value);
    }

    this.signal.emit("update", mask);
  }

  public watch<K extends keyof T>(
    key: K,
    handler: (value: T[K], store: T) => void
  ) {
    const watchHandler = (innerKey: keyof T, value: T[K]) => {
      if (innerKey === key) {
        handler(value, this.store);
      }
    };

    this.signal.connect("watch", watchHandler);
    return () => this.signal.disconnect("watch", watchHandler);
  }

  private getMaskBitByKey(key: keyof T): BitMask {
    let maskBit = this.signalMaskBits[key];
    if (maskBit === void 0) {
      maskBit = this.signalMaskBits[key] = BitMask.FromBitIndex(
        ++this.signalMaskBitPointer
      );
    }

    return maskBit!;
  }
}

export function createStore<T, M, A>(
  initValue: T,
  mutators: AkiMutator<T, M>,
  aggregators?: AkiAggregator<T, M, A>
) {
  return new AkiStore<T, M, A>(initValue, mutators, aggregators);
}
