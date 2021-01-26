import React, { FunctionComponent } from 'react';
import { mergeDisplayNameByRole } from '../helper';
import { AkiStore } from '../store';

export interface AkiContainerProps {}

export function buildContainer<T, M, A>(
  context: React.Context<AkiStore<T, M, A>>,
  store: AkiStore<any, any, any>,
  role: string = ''
) {
  const Container: FunctionComponent<AkiContainerProps> = React.memo(
    (props) => {
      const { children } = props;

      return <context.Provider value={store}>{children}</context.Provider>;
    }
  );
  Container.displayName = mergeDisplayNameByRole('AkiContainer', role);

  return Container;
}
