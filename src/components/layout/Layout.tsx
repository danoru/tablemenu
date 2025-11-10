import Footer from "./Footer";
import Navbar from "./Navbar";

function Layout(props: any) {
  return (
    <>
      <Navbar />
      <main>{props.children}</main>
      <Footer />
    </>
  );
}

export default Layout;
