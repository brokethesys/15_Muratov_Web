import type { PropsWithChildren } from 'react';

import { Footer } from './Footer';
import { Header } from './Header';

export const AppLayout = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <>
      <Header />
      <main className="container page-content">{children}</main>
      <Footer />
    </>
  );
};
