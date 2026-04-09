import { FONT_SANS, FONT_SERIF, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
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

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((m) => m.PDFViewer), {
  ssr: false,
  loading: () => <PdfLoadingSpinner />,
});

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

const MenuPdfDocument = dynamic(() => import("./MenuPDFDocument"), { ssr: false });

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
      <CircularProgress size={28} sx={{ color: "primary.main" }} />
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
        Preparing preview…
      </Typography>
    </Box>
  );
}

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
      <Button
        onClick={handleOpen}
        startIcon={<PictureAsPdfIcon />}
        sx={{
          background: "transparent",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          color: TEXT_DIM,
          fontFamily: FONT_SANS,
          fontSize: "14px",
          fontWeight: 500,
          padding: "10px 20px",
          textTransform: "none",
          "&:hover": {
            background: "rgba(180,140,60,0.08)",
            color: "text.primary",
            borderColor: "primary.main",
          },
        }}
      >
        Export as PDF
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "14px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: "20px",
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Menu Preview
            </Typography>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
              8.5 × 11 in
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                        <CircularProgress size={14} sx={{ color: "primary.main" }} />
                      ) : (
                        <PictureAsPdfIcon sx={{ fontSize: "15px !important" }} />
                      )
                    }
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: "8px",
                      color: "background.default",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "7px 16px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "primary.light" },
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
