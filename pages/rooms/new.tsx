import { authOptions } from "@/lib/authOptions";
import {
  BORDER_INK,
  FONT_SANS,
  FONT_SERIF,
  SHADOW_HARD,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
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

const inputSx = {
  mb: "16px",
  "& .MuiInputLabel-root": {
    fontFamily: FONT_SANS,
    fontSize: "14px",
    color: TEXT_FAINT,
    "&.Mui-focused": { color: "primary.main" },
  },
  "& .MuiOutlinedInput-root": {
    fontFamily: FONT_SANS,
    fontSize: "15px",
    color: "text.primary",
  },
  "& .MuiFormHelperText-root": {
    fontFamily: FONT_SANS,
    fontSize: "12px",
    color: "error.main",
    ml: 0,
  },
};

const sectionLabel = {
  fontFamily: FONT_SANS,
  fontSize: "11px",
  fontWeight: 700,
  color: "text.secondary",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  mb: "12px",
};

const validationSchema = Yup.object({
  name: Yup.string().max(60, "Max 60 characters").required("Room name is required"),
  description: Yup.string().max(200, "Max 200 characters"),
});

const TIME_MARKS = [
  { value: 60, label: "1hr" },
  { value: 120, label: "2hr" },
  { value: 180, label: "3hr" },
  { value: 240, label: "4hr+" },
];

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

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "580px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Typography
            onClick={() => router.push("/dashboard")}
            sx={{
              ...sectionLabel,
              mb: "12px",
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
            }}
          >
            ← Dashboard
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "30px", md: "38px" },
              fontWeight: 900,
              color: "text.primary",
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
              backgroundColor: "background.paper",
              border: BORDER_INK,
              borderRadius: "13px",
              boxShadow: SHADOW_HARD,
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

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

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
                          color: "text.primary",
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
                        color: "primary.main",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "primary.main",
                          "&:hover": { boxShadow: `0 0 0 8px rgba(192,69,44,0.15)` },
                        },
                        "& .MuiSlider-rail": { background: "rgba(51,39,26,0.25)" },
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

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

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
                          color: "text.primary",
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
                        color: "primary.main",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "primary.main",
                          "&:hover": { boxShadow: `0 0 0 8px rgba(192,69,44,0.15)` },
                        },
                        "& .MuiSlider-rail": { background: "rgba(51,39,26,0.25)" },
                        "& .MuiSlider-mark": { background: "rgba(51,39,26,0.25)" },
                        "& .MuiSlider-markLabel": {
                          fontFamily: FONT_SANS,
                          fontSize: "11px",
                          color: TEXT_FAINT,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                      variant="contained"
                      sx={{ fontSize: "15px", padding: "13px" }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: "inherit" }} />
                      ) : (
                        "Create room"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push("/dashboard")}
                      sx={{ fontSize: "15px", padding: "13px 20px" }}
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
