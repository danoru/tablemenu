import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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
import dynamic from "next/dynamic";
import React from "react";

import { buildTastingNotes } from "@/lib/menu/format";
import type { MenuSelection, SectionConfig } from "@/lib/menu/types";
import { FONT_SANS, FONT_SERIF, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";

interface Props {
  menu: MenuSelection;
  sections: readonly SectionConfig[];
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

export default function ExportMenuButton({ menu, sections }: Props) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Derived once per open — the tasting notes + date the PDF renders from.
  const tastingNotes = React.useMemo(() => buildTastingNotes(Object.values(menu).flat()), [menu]);
  const date = React.useMemo(() => new Date(), [menu]);

  // BGG art routed through our cover proxy: same-origin + JPEG, both of which
  // the in-browser PDF renderer needs (geekdo blocks CORS and may serve webp).
  const covers = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const game of Object.values(menu).flat()) {
      if (game.imageUrl) {
        map[String(game.gameId)] = `/api/games/cover?src=${encodeURIComponent(game.imageUrl)}`;
      }
    }
    return map;
  }, [menu]);

  function handleOpen() {
    setOpen(true);
    setMounted(true);
  }

  function handleClose() {
    setOpen(false);
  }

  const filename = `tablekeeper-menu-${date.toISOString().slice(0, 10)}.pdf`;

  const doc = (
    <MenuPdfDocument
      covers={covers}
      date={date}
      menu={menu}
      sections={sections}
      tastingNotes={tastingNotes}
    />
  );

  return (
    <>
      <Button
        startIcon={<PictureAsPdfIcon />}
        sx={{
          fontSize: "14px",
          padding: "10px 20px",
        }}
        variant="outlined"
        onClick={handleOpen}
      >
        Export as PDF
      </Button>

      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        PaperProps={{
          sx: {
            overflow: "hidden",
          },
        }}
        onClose={handleClose}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid",
            borderColor: "divider",
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
                document={doc}
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
                        <CircularProgress size={14} sx={{ color: "text.disabled" }} />
                      ) : (
                        <PictureAsPdfIcon sx={{ fontSize: "15px !important" }} />
                      )
                    }
                    sx={{
                      fontSize: "13px",
                      padding: "7px 16px",
                    }}
                    variant="contained"
                  >
                    {loading ? "Building PDF…" : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            <IconButton
              size="small"
              sx={{ color: TEXT_FAINT, "&:hover": { color: TEXT_DIM } }}
              onClick={handleClose}
            >
              <CloseIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ padding: 0, height: "70vh", overflow: "hidden" }}>
          {mounted ? (
            <PDFViewer height="100%" showToolbar={false} style={{ border: "none" }} width="100%">
              {doc}
            </PDFViewer>
          ) : (
            <PdfLoadingSpinner />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
