import {
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD_FADED,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function NotFoundPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>404 — Tablekeeper</title>
      </Head>

      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "60%",
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(180,110,30,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Typography
          sx={{
            position: "absolute",
            fontFamily: FONT_SERIF,
            fontSize: "clamp(180px, 30vw, 320px)",
            fontWeight: 900,
            fontStyle: "italic",
            color: GOLD_FADED,
            userSelect: "none",
            lineHeight: 1,
            letterSpacing: "-8px",
            pointerEvents: "none",
          }}
        >
          404
        </Typography>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "480px",
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "11px",
              fontWeight: 500,
              color: TEXT_FAINT,
              letterSpacing: "2px",
              textTransform: "uppercase",
              mb: "16px",
            }}
          >
            Page not found
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "32px", md: "42px" },
              fontWeight: 900,
              fontStyle: "italic",
              color: "text.primary",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              mb: "16px",
            }}
          >
            You've left the table.
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "15px",
              fontWeight: 300,
              color: TEXT_DIM,
              lineHeight: 1.7,
              mb: "36px",
            }}
          >
            This seat doesn't exist — or the game has already moved on without it.
          </Typography>

          <Box
            sx={{
              width: "40px",
              height: "1px",
              background: `linear-gradient(to right, transparent, divider, transparent)`,
              margin: "0 auto 36px",
            }}
          />

          <Box sx={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              onClick={() => router.push(session ? "/dashboard" : "/")}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "8px",
                color: "primary.contrastText",
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "11px 24px",
                textTransform: "none",
                "&:hover": { backgroundColor: "primary.light" },
              }}
            >
              Back to the table
            </Button>
            <Button
              onClick={() => router.back()}
              sx={{
                backgroundColor: "transparent",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                color: TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "11px 24px",
                textTransform: "none",
                "&:hover": {
                  background: "rgba(180,140,60,0.06)",
                  borderColor: BORDER_AMBER,
                  color: "text.primary",
                },
              }}
            >
              Go back
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
