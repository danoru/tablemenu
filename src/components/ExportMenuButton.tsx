import React from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { LibraryGame } from "@pages/api/games/library";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseConfig {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly subtitle: string;
}

export interface MenuSelection {
  [courseId: string]: LibraryGame[];
}

interface Props {
  menu: MenuSelection;
  courses: readonly CourseConfig[];
}

// ─── Colour constants (match MenuPage) ────────────────────────────────────────

const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Playfair Display', serif";

// ─── Lazy-loaded PDF components (no SSR) ─────────────────────────────────────
//
// @react-pdf/renderer uses browser APIs and must not run on the server.
// We lazy-load both the viewer and the download link via next/dynamic.

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((m) => m.PDFViewer), {
  ssr: false,
  loading: () => <PdfLoadingSpinner />,
});

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

const MenuPdfDocument = dynamic(() => import("./MenuPDFDocument"), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PdfLoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "12px",
        minHeight: "300px",
      }}
    >
      <CircularProgress size={28} sx={{ color: AMBER }} />
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
        Preparing preview…
      </Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExportMenuButton({ menu, courses }: Props) {
  const [open, setOpen] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);

  function handleOpen() {
    setOpen(true);
    setMounted(true);
  }

  function handleClose() {
    setOpen(false);
  }

  const filename = `tablekeeper-menu-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <>
      {/* ── Trigger button ── */}
      <Button
        onClick={handleOpen}
        startIcon={<PictureAsPdfIcon />}
        sx={{
          background: "transparent",
          border: `1px solid ${BORDER}`,
          borderRadius: "8px",
          color: TEXT_DIM,
          fontFamily: FONT_SANS,
          fontSize: "14px",
          fontWeight: 500,
          padding: "10px 20px",
          textTransform: "none",
          "&:hover": {
            background: "rgba(180,140,60,0.08)",
            color: TEXT,
            borderColor: AMBER,
          },
        }}
      >
        Export as PDF
      </Button>

      {/* ── Preview modal ── */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: BG_CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "14px",
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog header */}
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: "20px",
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Menu Preview
            </Typography>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
              8.5 × 11 in
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Download link — renders once MenuPdfDocument is ready */}
            {mounted && (
              <PDFDownloadLink
                document={<MenuPdfDocument menu={menu} courses={courses} />}
                fileName={filename}
                style={{ textDecoration: "none" }}
              >
                {({
                  loading,
                }: {
                  loading: boolean;
                  url: string | null;
                  error: Error | null;
                  blob: Blob | null;
                }) => (
                  <Button
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={14} sx={{ color: AMBER }} />
                      ) : (
                        <PictureAsPdfIcon sx={{ fontSize: "15px !important" }} />
                      )
                    }
                    sx={{
                      background: AMBER,
                      borderRadius: "8px",
                      color: "#0f0c08",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "7px 16px",
                      textTransform: "none",
                      "&:hover": { background: AMBER_HOVER },
                      "&.Mui-disabled": {
                        background: "rgba(200,150,42,0.4)",
                        color: "rgba(15,12,8,0.5)",
                      },
                    }}
                  >
                    {loading ? "Building PDF…" : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: TEXT_FAINT, "&:hover": { color: TEXT_DIM } }}
            >
              <CloseIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* PDF preview */}
        <DialogContent sx={{ padding: 0, height: "70vh", overflow: "hidden" }}>
          {mounted ? (
            <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: "none" }}>
              <MenuPdfDocument menu={menu} courses={courses} />
            </PDFViewer>
          ) : (
            <PdfLoadingSpinner />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
