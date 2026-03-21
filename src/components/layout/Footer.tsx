import Box from "@mui/material/Box";

const styles = {
  footer: {
    borderTop: "1px solid rgba(180,140,60,0.1)",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },

  footerLogo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "14px",
    color: "rgba(232,201,122,0.3)",
  },

  footerCopy: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    color: "rgba(232,223,200,0.22)",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" sx={styles.footer}>
      <Box sx={styles.footerLogo}>Tablekeeper</Box>
      <Box sx={styles.footerCopy}>© {year} Tablekeeper</Box>
    </Box>
  );
}
