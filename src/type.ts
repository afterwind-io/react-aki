export type ParamType<T> = T extends (...args: infer R) => void ? R : any[];
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : unknown;

export type AkiBatchExecutor<T, M, A> = (context: {
  batchMutate: (values: Partial<T>) => void;
  batchMutators: M;
  batchAggregators: A;
}) => void | Promise<void>;

export type AkiBatcher<T, M, A> = (
  executor: AkiBatchExecutor<T, M, A>
) => Promise<void>;

export type AkiMutator<T, M> = {
  [K in keyof M]: (
    context: {
      store: T;
      mutate: (values: Partial<T>) => void;
    },
    ...params: ParamType<M[K]>
  ) => ReturnType<M[K]>;
};

export type AkiAggregator<T, M, A> = {
  [K in keyof A]: (
    context: {
      store: T;
      mutate: (values: Partial<T>) => void;
      mutators: M;
      aggregator: A;
      batch: AkiBatcher<T, M, A>;
    },
    ...params: ParamType<A[K]>
  ) => ReturnType<A[K]>;
};
