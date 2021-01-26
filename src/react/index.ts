import { AkiStore } from '../store';
import React from 'react';
import {
  buildAggregatorsHook,
  buildMutateHook,
  buildMutatorsHook,
  buildValueHook,
  buildWatchHook,
} from './hooks';
import { buildContainer } from './container';
import { mergeDisplayNameByRole } from '../helper';

export function createReactEssentials<T, M, A>(
  store: AkiStore<T, M, A>,
  role: string = ''
) {
  const context = React.createContext(store.clone());
  context.displayName = mergeDisplayNameByRole('AkiContext', role);

  return {
    AkiContainer: buildContainer(context, store, role),
    useAggregators: buildAggregatorsHook(context),
    useMutate: buildMutateHook(context),
    useMutators: buildMutatorsHook(context),
    useValue: buildValueHook(context),
    useWatch: buildWatchHook(context),
  };
}
