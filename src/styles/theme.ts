import { createTheme } from "@mui/material/styles";
import { Fraunces, Space_Grotesk } from "next/font/google";

export const fraunces = Fraunces({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const spaceGrotesk = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// ─── Café Press Palette ───────────────────────────────────────────────────────
// Light "cozy brutalist" system: oatmeal paper, warm ink for text AND borders
// (never pure black), hard offset shadows, earthy screen-print accents.

export const OAT = "#f4ebda"; // page background
export const SURFACE = "#fffbf0"; // cards, menus, elevated surfaces
export const INK = "#33271a"; // text, borders, shadows

export const BRICK = "#c0452c"; // primary accent / CTAs
const BRICK_LIGHT = "#d4573c"; // hover state
const BRICK_DARK = "#9c3823"; // pressed / active

export const MUSTARD = "#d9a036"; // ratings, highlights, Medium weight
export const OLIVE = "#6b7f3f"; // success, Light weight
export const TEAL = "#3f7f77"; // info, links-of-second-rank
export const PLUM = "#8e5a78"; // avatars, occasional flair

// Chip / fill tints (solid pastels — pair with 2px ink borders)
export const TINT_BRICK = "#f4d9d2";
export const TINT_MUSTARD = "#f3e4c2";
export const TINT_OLIVE = "#e2e8d4";
export const TINT_TEAL = "#d9e6e2";
export const TINT_PLUM = "#ecdce6";

// Ink alphas
const TEXT_PRIMARY = INK;
const TEXT_SECONDARY = "rgba(51,39,26,0.72)";
const TEXT_DISABLED = "rgba(51,39,26,0.38)";

const BORDER_SUBTLE = "rgba(51,39,26,0.18)"; // dividers, hairlines
const BORDER_DEFAULT = "rgba(51,39,26,0.4)"; // resting input outlines

// Structure tokens — the signature look
export const BORDER_INK = `2px solid ${INK}`;
export const SHADOW_HARD = `3px 3px 0 ${INK}`;
export const SHADOW_HARD_LG = `4px 4px 0 ${INK}`;
export const SHADOW_HARD_HOVER = `5px 5px 0 ${INK}`;

// ─── Legacy aliases ───────────────────────────────────────────────────────────
// Pre-redesign token names mapped onto Café Press values so the app re-skins
// wholesale. Retire these per-file during the page sweep; do not add new uses.

export const AMBER_DIM = TINT_BRICK; // was active-chip amber wash
export const BG_BLUE = TINT_TEAL;
export const BG_ELEVATED = SURFACE; // modals, drawers
export const BG_GREEN = TINT_OLIVE;
export const BLUE = TEAL;
export const BORDER_AMBER = INK; // emphasis/hover borders are now ink
export const BORDER_BLUE = TEAL;
export const BORDER_GREEN = OLIVE;
export const GOLD = BRICK; // was gold accent text on dark
export const GOLD_FADED = "rgba(192,69,44,0.65)";
export const GOLD_LIGHT = INK;
export const TEXT_DIM = TEXT_SECONDARY;
export const TEXT_FAINT = "rgba(51,39,26,0.5)";
export const RED = BRICK;

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONT_SERIF = `${fraunces.style.fontFamily}, serif`;
export const FONT_SANS = `${spaceGrotesk.style.fontFamily}, sans-serif`;

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",

    primary: {
      main: BRICK,
      light: BRICK_LIGHT,
      dark: BRICK_DARK,
      contrastText: SURFACE,
    },

    secondary: {
      main: OLIVE,
      light: "#86994f",
      dark: "#55652f",
      contrastText: SURFACE,
    },

    background: {
      default: OAT,
      paper: SURFACE,
    },

    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      disabled: TEXT_DISABLED,
    },

    divider: BORDER_SUBTLE,

    error: {
      main: "#b3362b",
      contrastText: SURFACE,
    },
    success: {
      main: OLIVE,
      contrastText: SURFACE,
    },
    info: {
      main: TEAL,
      contrastText: SURFACE,
    },
    warning: {
      main: MUSTARD,
      contrastText: INK,
    },
  },

  // ─── Typography ─────────────────────────────────────────────────────────────

  typography: {
    fontFamily: spaceGrotesk.style.fontFamily,

    h1: { fontFamily: FONT_SERIF, fontWeight: 900, fontSize: "3rem", letterSpacing: "-0.01em" },
    h2: { fontFamily: FONT_SERIF, fontWeight: 900, fontSize: "2.25rem", letterSpacing: "-0.01em" },
    h3: { fontFamily: FONT_SERIF, fontWeight: 700, fontSize: "1.75rem" },
    h4: { fontFamily: FONT_SERIF, fontWeight: 700, fontSize: "1.5rem" },
    h5: { fontWeight: 700, fontSize: "1.25rem" },
    h6: { fontWeight: 700, fontSize: "1rem" },
    subtitle1: { fontSize: "1rem" },
    subtitle2: { fontSize: "0.9rem" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.55 },
    button: { textTransform: "none", fontWeight: 700 },
    caption: { fontSize: "0.75rem", color: TEXT_SECONDARY },
  },

  // ─── Shape ──────────────────────────────────────────────────────────────────

  shape: { borderRadius: 10 },

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
          backgroundColor: OAT,
          color: TEXT_PRIMARY,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "::selection": {
          background: "rgba(217,160,54,0.45)",
          color: INK,
        },
        "::-webkit-scrollbar": { width: "8px" },
        "::-webkit-scrollbar-track": { background: OAT },
        "::-webkit-scrollbar-thumb": {
          background: "rgba(51,39,26,0.3)",
          borderRadius: "4px",
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "rgba(51,39,26,0.5)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "999px",
          fontFamily: spaceGrotesk.style.fontFamily,
          fontWeight: 700,
          letterSpacing: "0.2px",
          textTransform: "none",
        },
        // Chunky "sticker" treatment for real buttons; text-variant stays quiet.
        contained: {
          border: BORDER_INK,
          boxShadow: SHADOW_HARD,
          transition: "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease",
          "&:hover": {
            boxShadow: SHADOW_HARD_LG,
            transform: "translate(-1px, -1px)",
          },
          "&:active": {
            boxShadow: `1px 1px 0 ${INK}`,
            transform: "translate(1px, 1px)",
          },
          "&.Mui-disabled": {
            border: `2px solid ${TEXT_DISABLED}`,
            boxShadow: "none",
          },
        },
        outlined: {
          backgroundColor: SURFACE,
          border: BORDER_INK,
          boxShadow: SHADOW_HARD,
          color: INK,
          transition: "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease",
          "&:hover": {
            backgroundColor: SURFACE,
            border: BORDER_INK,
            boxShadow: SHADOW_HARD_LG,
            transform: "translate(-1px, -1px)",
          },
          "&:active": {
            boxShadow: `1px 1px 0 ${INK}`,
            transform: "translate(1px, 1px)",
          },
          "&.Mui-disabled": {
            border: `2px solid ${TEXT_DISABLED}`,
            boxShadow: "none",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          borderRadius: "10px",
          fontFamily: spaceGrotesk.style.fontFamily,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: BORDER_DEFAULT,
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: INK,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: INK,
            borderWidth: "2px",
          },
        },
        input: {
          color: TEXT_PRIMARY,
          "&::placeholder": { color: TEXT_DISABLED, opacity: 1 },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: SURFACE,
          border: BORDER_INK,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          border: BORDER_INK,
          borderRadius: "13px",
          boxShadow: SHADOW_HARD_LG,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: SURFACE,
          border: BORDER_INK,
          borderRadius: "10px",
          boxShadow: SHADOW_HARD,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: "14px",
          fontWeight: 500,
          color: TEXT_SECONDARY,
          "&:hover": {
            backgroundColor: "rgba(51,39,26,0.06)",
            color: TEXT_PRIMARY,
          },
          "&.Mui-selected": {
            backgroundColor: TINT_BRICK,
            "&:hover": { backgroundColor: TINT_BRICK },
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
          border: BORDER_INK,
          borderRadius: "10px",
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: "14px",
          fontWeight: 500,
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
          backgroundColor: INK,
          border: "none",
          borderRadius: "8px",
          color: SURFACE,
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: "12px",
          fontWeight: 500,
        },
        arrow: { color: INK },
      },
    },
  },
});

export default theme;
