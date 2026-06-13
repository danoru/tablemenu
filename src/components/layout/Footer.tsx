import { FONT_SANS, FONT_SERIF } from "@/styles/theme";
import Box from "@mui/material/Box";

const styles = {
  footer: {
    borderTop: "2px solid rgba(51,39,26,0.15)",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },

  footerLogo: {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: "14px",
    color: "rgba(51,39,26,0.45)",
  },

  footerCopy: {
    fontFamily: FONT_SANS,
    fontSize: "12px",
    color: "rgba(51,39,26,0.4)",
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
