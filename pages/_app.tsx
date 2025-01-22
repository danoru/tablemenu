import * as React from "react";
import createEmotionCache from "../src/createEmotionCache";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";
import Layout from "../src/components/layout/Layout";
import PropTypes from "prop-types";
import superjson from "superjson";
import theme from "../src/theme";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { Decimal } from "decimal.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";

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
                <title>Tablekeeper</title>
                <meta charSet="utf-8" />
                <meta
                  name="viewport"
                  content="initial-scale=1.0, width=device-width"
                />
                <link rel="shortcut icon" href="/favicon.ico" />
              </Head>
              <Component {...pageProps} />
            </Layout>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

superjson.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal.js"
);
