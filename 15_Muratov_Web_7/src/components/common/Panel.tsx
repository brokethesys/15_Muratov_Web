import type { PropsWithChildren } from 'react';

interface PanelProps extends PropsWithChildren {
  title?: string;
}

export const Panel = ({ title, children }: PanelProps): JSX.Element => {
  return (
    <article className="panel">
      {title ? <h3>{title}</h3> : null}
      {children}
    </article>
  );
};
