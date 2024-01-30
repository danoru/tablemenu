import Navbar from "./Navbar";
import Footer from "./footer";
import { Fragment } from "react";

function Layout(props: any) {
  return (
    <Fragment>
      <Navbar />
      <main>{props.children}</main>
      <Footer />
    </Fragment>
  );
}

export default Layout;
