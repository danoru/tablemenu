import Layout from "@components/layout/Layout";
import { AppCacheProvider } from "@mui/material-nextjs/v16-pagesRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@styles/theme";
import { Decimal } from "decimal.js";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import * as superjson from "superjson";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <AppCacheProvider {...props}>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Layout>
            <Head>
              <meta charSet="utf-8" />
              <meta content="initial-scale=1.0, width=device-width" name="viewport" />
              <link href="/images/logo.svg" rel="icon" type="image/svg+xml" />
              <title>Tablekeeper</title>
            </Head>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </SessionProvider>
    </AppCacheProvider>
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
