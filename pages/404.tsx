import { FONT_SANS, FONT_SERIF } from "@/styles/theme";
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
        <Typography
          sx={{
            position: "absolute",
            fontFamily: FONT_SERIF,
            fontSize: "clamp(180px, 30vw, 320px)",
            fontWeight: 900,
            fontStyle: "italic",
            color: "rgba(192,69,44,0.15)",
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
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: "0.1em",
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
              fontWeight: 400,
              color: "text.secondary",
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
              background: "rgba(51,39,26,0.18)",
              margin: "0 auto 36px",
            }}
          />

          <Box sx={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => router.push(session ? "/dashboard" : "/")}
              sx={{
                fontSize: "14px",
                padding: "11px 24px",
              }}
            >
              Back to the table
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{
                fontSize: "14px",
                padding: "11px 24px",
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
