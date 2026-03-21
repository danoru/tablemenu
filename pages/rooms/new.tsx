import { authOptions } from "@api/auth/[...nextauth]";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Slider,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import * as Yup from "yup";

// ─── Constants ────────────────────────────────────────────────────────────────

const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const BG = "#0f0c08";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

const inputSx = {
  mb: "16px",
  "& .MuiInputLabel-root": {
    fontFamily: FONT_SANS,
    fontSize: "14px",
    color: TEXT_FAINT,
    "&.Mui-focused": { color: AMBER },
  },
  "& .MuiOutlinedInput-root": {
    fontFamily: FONT_SANS,
    fontSize: "15px",
    color: TEXT,
    background: "rgba(255,255,255,0.03)",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_MED },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: AMBER },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: AMBER,
      borderWidth: "1px",
    },
  },
  "& .MuiFormHelperText-root": {
    fontFamily: FONT_SANS,
    fontSize: "12px",
    color: "rgba(220,100,100,0.9)",
    ml: 0,
  },
};

const sectionLabel = {
  fontFamily: FONT_SANS,
  fontSize: "11px",
  fontWeight: 500,
  color: TEXT_FAINT,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  mb: "12px",
};

// ─── Validation ───────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  name: Yup.string().max(60, "Max 60 characters").required("Room name is required"),
  description: Yup.string().max(200, "Max 200 characters"),
});

// ─── Time budget marks ────────────────────────────────────────────────────────

const TIME_MARKS = [
  { value: 60, label: "1hr" },
  { value: 120, label: "2hr" },
  { value: 180, label: "3hr" },
  { value: 240, label: "4hr+" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  username: string;
}

export default function NewRoomPage({ username }: Props) {
  const router = useRouter();
  const [playerCount, setPlayerCount] = React.useState<number>(4);
  const [timeBudget, setTimeBudget] = React.useState<number>(120);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  async function handleSubmit(
    values: { name: string; description: string },
    { setSubmitting }: any
  ) {
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description || undefined,
          playerCount,
          timeBudget,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: "Room created! Redirecting…", severity: "success" });
        setTimeout(() => router.push(`/rooms/${data.code}`), 800);
      } else {
        setSnackbar({
          open: true,
          message: data.error || "Failed to create room.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Create a Room — Tablekeeper</title>
      </Head>

      <Box sx={{ background: BG, minHeight: "100vh", position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "40vh",
            background:
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "580px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          {/* Header */}
          <Typography
            onClick={() => router.push("/dashboard")}
            sx={{ ...sectionLabel, mb: "12px", cursor: "pointer", "&:hover": { color: TEXT_DIM } }}
          >
            ← Dashboard
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "30px", md: "38px" },
              fontWeight: 900,
              color: TEXT,
              letterSpacing: "-0.5px",
              lineHeight: 1.05,
              mb: "8px",
            }}
          >
            Host a game night
          </Typography>
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mb: "32px" }}>
            Create a room, share the code, and let everyone's libraries come together.
          </Typography>

          <Box
            sx={{
              background: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "14px",
              padding: { xs: "24px", md: "32px 36px" },
            }}
          >
            <Formik
              initialValues={{ name: "", description: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
                <Form noValidate>
                  {/* Room name */}
                  <Typography sx={sectionLabel}>Room details</Typography>
                  <TextField
                    autoFocus
                    fullWidth
                    id="name"
                    label="Room name"
                    name="name"
                    placeholder="e.g. Friday Night Games"
                    value={values.name}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    id="description"
                    label="Description (optional)"
                    name="description"
                    placeholder="What's the vibe tonight?"
                    value={values.description}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={inputSx}
                  />

                  <Divider sx={{ borderColor: BORDER, mb: "24px" }} />

                  {/* Player count */}
                  <Typography sx={sectionLabel}>How many players?</Typography>
                  <Box sx={{ px: "8px", mb: "32px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
                      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                        Players tonight
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontSize: "20px",
                          fontWeight: 700,
                          color: TEXT,
                          lineHeight: 1,
                        }}
                      >
                        {playerCount}
                      </Typography>
                    </Box>
                    <Slider
                      min={2}
                      max={12}
                      step={1}
                      value={playerCount}
                      onChange={(_, v) => setPlayerCount(v as number)}
                      sx={{
                        color: AMBER,
                        "& .MuiSlider-thumb": {
                          background: AMBER,
                          "&:hover": { boxShadow: `0 0 0 8px rgba(200,150,42,0.15)` },
                        },
                        "& .MuiSlider-rail": { background: BORDER_MED },
                      }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography
                        sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}
                      >
                        2
                      </Typography>
                      <Typography
                        sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}
                      >
                        12
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: BORDER, mb: "24px" }} />

                  {/* Time budget */}
                  <Typography sx={sectionLabel}>Time budget</Typography>
                  <Box sx={{ px: "8px", mb: "32px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
                      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                        Available tonight
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontSize: "20px",
                          fontWeight: 700,
                          color: TEXT,
                          lineHeight: 1,
                        }}
                      >
                        {timeBudget >= 240
                          ? "4+ hrs"
                          : `${timeBudget / 60 >= 1 ? `${Math.floor(timeBudget / 60)}hr` : ""}${timeBudget % 60 > 0 ? ` ${timeBudget % 60}min` : ""}`}
                      </Typography>
                    </Box>
                    <Slider
                      min={30}
                      max={240}
                      step={30}
                      marks={TIME_MARKS}
                      value={timeBudget}
                      onChange={(_, v) => setTimeBudget(v as number)}
                      sx={{
                        color: AMBER,
                        "& .MuiSlider-thumb": {
                          background: AMBER,
                          "&:hover": { boxShadow: `0 0 0 8px rgba(200,150,42,0.15)` },
                        },
                        "& .MuiSlider-rail": { background: BORDER_MED },
                        "& .MuiSlider-mark": { background: BORDER_MED },
                        "& .MuiSlider-markLabel": {
                          fontFamily: FONT_SANS,
                          fontSize: "11px",
                          color: TEXT_FAINT,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: BORDER, mb: "24px" }} />

                  {/* Submit */}
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                      sx={{
                        background: AMBER,
                        borderRadius: "8px",
                        color: "#0f0c08",
                        fontFamily: FONT_SANS,
                        fontSize: "15px",
                        fontWeight: 500,
                        padding: "13px",
                        textTransform: "none",
                        "&:hover": { background: AMBER_HOVER },
                        "&.Mui-disabled": {
                          background: "rgba(200,150,42,0.35)",
                          color: "rgba(15,12,8,0.5)",
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: "rgba(15,12,8,0.5)" }} />
                      ) : (
                        "Create room"
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      sx={{
                        background: "transparent",
                        border: `1px solid ${BORDER_MED}`,
                        borderRadius: "8px",
                        color: TEXT_DIM,
                        fontFamily: FONT_SANS,
                        fontSize: "15px",
                        fontWeight: 500,
                        padding: "13px 20px",
                        textTransform: "none",
                        "&:hover": {
                          background: "rgba(180,140,60,0.08)",
                          color: TEXT,
                          borderColor: AMBER,
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: FONT_SANS }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return {
    props: { username: (session.user as any).username ?? "" },
  };
};
