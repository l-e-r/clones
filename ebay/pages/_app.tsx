import '../styles/globals.css'
import type { AppProps } from 'next/app'

import {ThemeProvider} from 'next-themes'


import { ThirdwebProvider } from "@thirdweb-dev/react";
import network from "../utils/network";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={network}>
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </ThirdwebProvider>
  );
};

export default MyApp
