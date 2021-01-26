import { AkiAggregator, AkiBatcher, AkiMutator, ParamType } from './type';

export function buildMutatorsApi<T, M>(
  origins: AkiMutator<T, M>,
  store: T,
  mutateFn: (values: Partial<T>) => void
): M {
  const api = Object.create(null);

  for (const key of Object.keys(origins) as (keyof M)[]) {
    const originMutateFn = origins[key];

    api[key] = (...args: ParamType<M[typeof key]>) =>
      originMutateFn(
        {
          store,
          mutate: mutateFn,
        },
        ...args
      );
  }

  return api as M;
}

export function buildAggregatorsApi<T, M, A>(
  origins: AkiAggregator<T, M, A>,
  store: T,
  mutateFn: (values: Partial<T>) => void,
  mutators: M,
  batch: AkiBatcher<T, M, A>
): A {
  const api = Object.create(null);

  for (const key of Object.keys(origins) as (keyof A)[]) {
    const originAggregateFn = origins[key];

    api[key] = (...args: ParamType<A[typeof key]>) =>
      originAggregateFn(
        {
          store,
          mutate: mutateFn,
          mutators,
          aggregator: api,
          batch,
        },
        ...args
      );
  }

  return api as A;
}

export function mergeDisplayNameByRole(
  originName: string,
  role: string
): string {
  if (role === '') {
    return originName;
  } else {
    return `${originName}-${role}`;
  }
}

export function simpleDeepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
