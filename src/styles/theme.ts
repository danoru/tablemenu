import { createTheme } from "@mui/material/styles";
import { DM_Sans } from "next/font/google";

export const dmSans = DM_Sans({
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// ─── Palette Tokens ───────────────────────────────────────────────────────────

const AMBER_MAIN = "#c8962a"; // primary CTA buttons // primary.main
const AMBER_LIGHT = "#dba535"; // hover state // primary.light
const AMBER_DARK = "#a37820"; // pressed / active // primary.dark

const CONTRAST_TEXT = "#0f0c08"; // *.contrastText

const GREEN_MAIN = "#3a7d50"; // secondary accent (Quick Gen tag, success) // secondary.main
const GREEN_LIGHT = "#5ec97a"; // bright green for badges / dots // secondary.light
const GREEN_DARK = "#28593a"; // secondary.dark

const BG_DEFAULT = "#0f0c08"; // page background — deep brown-black // background.default
const BG_PAPER = "#1a1610"; // cards, menus, elevated surfaces // background.paper

const TEXT_PRIMARY = "#f0e6cc"; // headings, primary labels // text.primary
const TEXT_SECONDARY = "rgba(232,223,200,0.60)"; // body copy, descriptions // text.secondary
const TEXT_DISABLED = "rgba(232,223,200,0.30)"; // placeholder, disabled

const BORDER_SUBTLE = "rgba(180,140,60,0.15)"; // nav borders, dividers // divider // BORDER_SUBTLE
const BORDER_DEFAULT = "rgba(180,140,60,0.25)"; // input outlines
const BORDER_FOCUS = "rgba(180,140,60,0.60)"; // focused inputs

// ─── Additional Tokens ────────────────────────────────────────────────────────────────────

export const AMBER_DIM = "rgba(200,150,42,0.15)";
export const BG_BLUE = "rgba(34,60,100,0.25)";
export const BG_ELEVATED = "#221e14"; // modals, drawers
export const BG_GREEN = "rgba(34,85,48,0.18)";
export const BLUE = "#5c9ee0";
export const BORDER_AMBER = "rgba(180,140,60,0.3)";
export const BORDER_BLUE = "rgba(60,100,200,0.3)";
export const BORDER_GREEN = "rgba(60,160,80,0.3)";
export const GOLD = "#e8c97a"; // gold text on dark backgrounds
export const GOLD_FADED = "rgba(232,201,122,0.15)";
export const GOLD_LIGHT = "#c8b880";
export const TEXT_DIM = "rgba(232,223,200,0.55)";
export const TEXT_FAINT = "rgba(232,223,200,0.28)";
export const RED = "#e05c5c";

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONT_SERIF = "'Playfair Display', serif";
export const FONT_SANS = "'DM Sans', sans-serif";

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",

    primary: {
      main: AMBER_MAIN,
      light: AMBER_LIGHT,
      dark: AMBER_DARK,
      contrastText: CONTRAST_TEXT,
    },

    secondary: {
      main: GREEN_MAIN,
      light: GREEN_LIGHT,
      dark: GREEN_DARK,
      contrastText: CONTRAST_TEXT,
    },

    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
    },

    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      disabled: TEXT_DISABLED,
    },

    divider: BORDER_SUBTLE,

    error: {
      main: "#e05252",
      contrastText: CONTRAST_TEXT,
    },
    success: {
      main: GREEN_LIGHT,
      contrastText: CONTRAST_TEXT,
    },
    info: {
      main: "#5b9bd5",
      contrastText: CONTRAST_TEXT,
    },
    warning: {
      main: GOLD,
      contrastText: CONTRAST_TEXT,
    },
  },

  // ─── Typography ─────────────────────────────────────────────────────────────

  typography: {
    fontFamily: dmSans.style.fontFamily,

    h1: { fontWeight: 700, fontSize: "3rem" },
    h2: { fontWeight: 700, fontSize: "2.25rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 500, fontSize: "1.25rem" },
    h6: { fontWeight: 500, fontSize: "1rem" },
    subtitle1: { fontSize: "1rem" },
    subtitle2: { fontSize: "0.9rem" },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 500 },
    caption: { fontSize: "0.75rem", color: TEXT_SECONDARY },
  },

  // ─── Shape ──────────────────────────────────────────────────────────────────

  shape: { borderRadius: 8 },

  // ─── Spacing ────────────────────────────────────────────────────────────────

  spacing: 8,

  // ─── Breakpoints ────────────────────────────────────────────────────────────

  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },

  // ─── Component overrides ────────────────────────────────────────────────────

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG_DEFAULT,
          color: TEXT_PRIMARY,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "::selection": {
          background: "rgba(200,150,42,0.35)",
          color: TEXT_PRIMARY,
        },
        "::-webkit-scrollbar": { width: "6px" },
        "::-webkit-scrollbar-track": { background: BG_DEFAULT },
        "::-webkit-scrollbar-thumb": {
          background: "rgba(180,140,60,0.3)",
          borderRadius: "3px",
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "rgba(180,140,60,0.5)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontFamily: dmSans.style.fontFamily,
          fontWeight: 500,
          letterSpacing: "0.3px",
          textTransform: "none",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: dmSans.style.fontFamily,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: BORDER_DEFAULT,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(180,140,60,0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: BORDER_FOCUS,
            borderWidth: "1px",
          },
        },
        input: {
          color: TEXT_PRIMARY,
          "&::placeholder": { color: TEXT_DISABLED },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: BG_PAPER,
          border: `1px solid ${BORDER_SUBTLE}`,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_ELEVATED,
          border: `1px solid ${BORDER_SUBTLE}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: dmSans.style.fontFamily,
          fontSize: "14px",
          color: TEXT_SECONDARY,
          "&:hover": {
            backgroundColor: "rgba(180,140,60,0.08)",
            color: TEXT_PRIMARY,
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(180,140,60,0.12)",
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: BORDER_SUBTLE },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: dmSans.style.fontFamily,
          fontSize: "14px",
          borderRadius: "8px",
        },
      },
    },

    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: BG_ELEVATED,
          border: `1px solid ${BORDER_SUBTLE}`,
          color: TEXT_PRIMARY,
          fontFamily: dmSans.style.fontFamily,
          fontSize: "12px",
        },
        arrow: { color: BG_ELEVATED },
      },
    },
  },
});

export default theme;
