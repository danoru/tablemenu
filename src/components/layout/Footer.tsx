import { BORDER_SUBTLE, FONT_SANS, FONT_SERIF, TEXT_FAINT } from "@/styles/theme";
import Box from "@mui/material/Box";

const styles = {
  footer: {
    borderTop: `2px solid ${BORDER_SUBTLE}`,
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
    color: TEXT_FAINT,
  },

  footerCopy: {
    fontFamily: FONT_SANS,
    fontSize: "12px",
    color: TEXT_FAINT,
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
