import Head from "next/head";

import Layout from "../src/components/layout/layout";

import "../src/styles/global.css";

function App({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
        <title>Tablekeeper</title>
        <meta name="description" content="Tablekeeper" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default App;