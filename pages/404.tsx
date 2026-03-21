import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const GOLD = "#e8c97a";
const GOLD_FADED = "rgba(232,201,122,0.15)";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const BG = "#0f0c08";
const BORDER = "rgba(180,140,60,0.15)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

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
          background: BG,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
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

        {/* Large background 404 */}
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

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "480px",
          }}
        >
          {/* Overline */}
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
              color: TEXT,
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

          {/* Divider */}
          <Box
            sx={{
              width: "40px",
              height: "1px",
              background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              margin: "0 auto 36px",
            }}
          />

          {/* Actions */}
          <Box sx={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              onClick={() => router.push(session ? "/dashboard" : "/")}
              sx={{
                background: AMBER,
                borderRadius: "8px",
                color: "#0f0c08",
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "11px 24px",
                textTransform: "none",
                "&:hover": { background: AMBER_HOVER },
              }}
            >
              Back to the table
            </Button>
            <Button
              onClick={() => router.back()}
              sx={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                color: TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "11px 24px",
                textTransform: "none",
                "&:hover": {
                  background: "rgba(180,140,60,0.06)",
                  borderColor: "rgba(180,140,60,0.28)",
                  color: TEXT,
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
