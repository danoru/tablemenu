import Header from "./header";
import Footer from "./footer";
import { Fragment } from "react";

function Layout(props: any) {
  return (
    <Fragment>
      <Header />
      <main>{props.children}</main>
      <Footer />
    </Fragment>
  );
}

export default Layout;
