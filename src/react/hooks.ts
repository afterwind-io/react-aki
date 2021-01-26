import { useContext, useState, useRef, useEffect } from 'react';
import { AkiStore } from '../store';

export function buildValueHook<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>
) {
  return function useValue(...keys: (keyof T)[]): T {
    const c: AkiStore<T, M, A> = useContext(context) as any;

    const [_, update] = useState(0);

    const teardown = useRef<(() => void) | null>(null);
    if (!teardown.current) {
      teardown.current = c.register(keys, () => update((n) => n + 1));
    }
    useEffect(() => teardown.current!, []);

    return c.store;
  };
}

export function buildMutateHook<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>
) {
  return function useMutate() {
    const { mutate } = useContext(context);
    return mutate;
  };
}

export function buildMutatorsHook<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>
) {
  return function useMutators() {
    const { mutators } = useContext(context);
    return mutators;
  };
}

export function buildAggregatorsHook<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>
) {
  return function useAggregators() {
    const { aggregators } = useContext(context);
    return aggregators;
  };
}

export function buildWatchHook<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>
) {
  return function useWatch<T, K extends keyof T>(
    key: K,
    handler: (value: T[K], store: T) => void
  ) {
    const c: AkiStore<T, M, A> = useContext(context) as any;

    const teardown = useRef<(() => void) | null>(null);
    if (!teardown.current) {
      teardown.current = c.watch(key, handler);
    }
    useEffect(() => teardown.current!, []);
  };
}
