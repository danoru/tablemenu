import { CacheProvider, EmotionCache } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Decimal } from "decimal.js";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import * as superjson from "superjson";

import Layout from "../src/components/layout/Layout";
import createEmotionCache from "../src/createEmotionCache";
import theme from "../src/theme";

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: MyAppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Layout>
              <Head>
                <meta charSet="utf-8" />
                <meta content="initial-scale=1.0, width=device-width" name="viewport" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <title>Tablekeeper</title>
              </Head>
              <Component {...pageProps} />
            </Layout>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}

superjson.registerCustom<Decimal, string>(
  {
    isApplicable: (v: any): v is Decimal => Decimal.isDecimal(v),
    serialize: (v: any) => v.toJSON(),
    deserialize: (v: any) => new Decimal(v),
  },
  "decimal.js"
);
