function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ padding: "1rem 0", textAlign: "center" }}>
      <p>ⓒ {year} Tablekeeper</p>
    </footer>
  );
}

export default Footer;
