import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Slider,
  Snackbar,
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

import { authOptions } from "@api/auth/[...nextauth]";
import prisma from "@data/db";

// ─── Constants ────────────────────────────────────────────────────────────────

const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const GREEN_BRIGHT = "#5ec97a";
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
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: AMBER, borderWidth: "1px" },
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

const TIME_MARKS = [
  { value: 60, label: "1hr" },
  { value: 120, label: "2hr" },
  { value: 180, label: "3hr" },
  { value: 240, label: "4hr+" },
];

// ─── Toggle button ────────────────────────────────────────────────────────────

function ToggleOption({
  label,
  sublabel,
  active,
  onClick,
  accent = AMBER,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        padding: "14px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        background: active
          ? `rgba(${accent === GREEN_BRIGHT ? "34,85,48" : "180,110,30"},0.2)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? (accent === GREEN_BRIGHT ? "rgba(60,160,80,0.35)" : BORDER_MED) : BORDER}`,
        transition: "all 0.15s",
        "&:hover": { borderColor: active ? undefined : BORDER_MED },
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "14px",
          fontWeight: 500,
          color: active ? TEXT : TEXT_DIM,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "3px" }}>
        {sublabel}
      </Typography>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomData {
  id: number;
  name: string;
  description: string;
  code: string;
  type: "CASUAL" | "RECURRING";
  visibility: "PUBLIC" | "INVITE_ONLY";
  playerCount: number;
  timeBudget: number;
}

interface Props {
  room: RoomData;
  username: string;
}

const validationSchema = Yup.object({
  name: Yup.string().max(60, "Max 60 characters").required("Room name is required"),
  description: Yup.string().max(200, "Max 200 characters"),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoomSettingsPage({ room, username }: Props) {
  const router = useRouter();
  const { code } = router.query as { code: string };

  const [roomType, setRoomType] = React.useState<"CASUAL" | "RECURRING">(room.type);
  const [visibility, setVisibility] = React.useState<"PUBLIC" | "INVITE_ONLY">(room.visibility);
  const [playerCount, setPlayerCount] = React.useState(room.playerCount || 4);
  const [timeBudget, setTimeBudget] = React.useState(room.timeBudget || 120);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  function formatTimeBudget(mins: number) {
    if (mins >= 240) return "4+ hrs";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}hr` : ""}${m > 0 ? ` ${m}min` : ""}`.trim();
  }

  async function handleSubmit(
    values: { name: string; description: string },
    { setSubmitting }: any
  ) {
    try {
      const res = await fetch(`/api/rooms/${code}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description || null,
          playerCount,
          timeBudget,
          type: roomType,
          visibility,
        }),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Room updated!", severity: "success" });
        setTimeout(() => router.push(`/rooms/${code}`), 1000);
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error || "Failed to update room.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${code}/settings`, { method: "DELETE" });
      if (res.ok) {
        setDeleteOpen(false);
        setSnackbar({ open: true, message: "Room archived.", severity: "success" });
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error || "Failed to archive room.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Room Settings — Tablekeeper</title>
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
            maxWidth: "600px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          {/* Header */}
          <Typography
            onClick={() => router.push(`/rooms/${code}`)}
            sx={{ ...sectionLabel, mb: "12px", cursor: "pointer", "&:hover": { color: TEXT_DIM } }}
          >
            ← Back to room
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "28px", md: "36px" },
              fontWeight: 900,
              color: TEXT,
              letterSpacing: "-0.5px",
              lineHeight: 1.05,
              mb: "6px",
            }}
          >
            Room settings
          </Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", mb: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
              Code:
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 700,
                color: TEXT_DIM,
                letterSpacing: "2px",
              }}
            >
              {room.code}
            </Typography>
          </Box>

          <Formik
            initialValues={{ name: room.name, description: room.description }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
              <Form noValidate>
                {/* ── Details ─────────────────────────────────────────────── */}
                <Box
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Room details</Typography>

                  <TextField
                    fullWidth
                    id="name"
                    label="Room name"
                    name="name"
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
                    value={values.description}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ ...inputSx, mb: 0 }}
                  />
                </Box>

                {/* ── Room type ────────────────────────────────────────────── */}
                <Box
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Room type</Typography>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <ToggleOption
                      label="Casual"
                      sublabel="One-off session, expires after use"
                      active={roomType === "CASUAL"}
                      onClick={() => setRoomType("CASUAL")}
                    />
                    <ToggleOption
                      label="Recurring"
                      sublabel="Persistent — reopen each week"
                      active={roomType === "RECURRING"}
                      onClick={() => setRoomType("RECURRING")}
                      accent={GREEN_BRIGHT}
                    />
                  </Box>
                </Box>

                {/* ── Visibility ───────────────────────────────────────────── */}
                <Box
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Visibility</Typography>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <ToggleOption
                      label="Public"
                      sublabel="Anyone with the code can join"
                      active={visibility === "PUBLIC"}
                      onClick={() => setVisibility("PUBLIC")}
                    />
                    <ToggleOption
                      label="Invite only"
                      sublabel="You approve each join request"
                      active={visibility === "INVITE_ONLY"}
                      onClick={() => setVisibility("INVITE_ONLY")}
                    />
                  </Box>
                </Box>

                {/* ── Players & time ───────────────────────────────────────── */}
                <Box
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Default settings</Typography>

                  {/* Player count */}
                  <Box sx={{ mb: "28px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
                      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                        Players
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
                          "&:hover": { boxShadow: "0 0 0 8px rgba(200,150,42,0.15)" },
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

                  {/* Time budget */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
                      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                        Time budget
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
                        {formatTimeBudget(timeBudget)}
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
                          "&:hover": { boxShadow: "0 0 0 8px rgba(200,150,42,0.15)" },
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
                </Box>

                {/* ── Save ─────────────────────────────────────────────────── */}
                <Box sx={{ display: "flex", gap: "10px", mb: "40px" }}>
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
                      "Save changes"
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push(`/rooms/${code}`)}
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

                {/* ── Danger zone ──────────────────────────────────────────── */}
                <Box
                  sx={{
                    background: "rgba(220,80,80,0.05)",
                    border: "1px solid rgba(220,80,80,0.2)",
                    borderRadius: "14px",
                    padding: { xs: "24px", md: "28px 32px" },
                  }}
                >
                  <Typography sx={{ ...sectionLabel, color: "rgba(220,120,120,0.6)" }}>
                    Danger zone
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: TEXT,
                        }}
                      >
                        Archive this room
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "13px",
                          color: TEXT_FAINT,
                          mt: "2px",
                        }}
                      >
                        The room will be deactivated. History is preserved.
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => setDeleteOpen(true)}
                      sx={{
                        background: "transparent",
                        border: "1px solid rgba(220,80,80,0.35)",
                        borderRadius: "8px",
                        color: "rgba(220,120,120,0.8)",
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        padding: "8px 18px",
                        textTransform: "none",
                        flexShrink: 0,
                        "&:hover": {
                          background: "rgba(220,80,80,0.1)",
                          borderColor: "rgba(220,80,80,0.6)",
                          color: "rgba(220,120,120,1)",
                        },
                      }}
                    >
                      Archive room
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>

      {/* ── Confirm archive dialog ─────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        PaperProps={{
          sx: {
            background: "#1a1610",
            border: "1px solid rgba(220,80,80,0.25)",
            borderRadius: "14px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          },
        }}
      >
        <DialogTitle
          sx={{ fontFamily: FONT_SERIF, fontSize: "20px", fontWeight: 700, color: TEXT }}
        >
          Archive "{room.name}"?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM }}>
            The room will be deactivated and removed from your dashboard. Your play history and
            member list are preserved — this is not permanent deletion.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px", gap: "8px" }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{
              background: "transparent",
              border: `1px solid ${BORDER_MED}`,
              borderRadius: "8px",
              color: TEXT_DIM,
              fontFamily: FONT_SANS,
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 18px",
              textTransform: "none",
              "&:hover": { background: "rgba(180,140,60,0.08)", color: TEXT },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              background: "rgba(220,80,80,0.15)",
              border: "1px solid rgba(220,80,80,0.35)",
              borderRadius: "8px",
              color: "rgba(220,120,120,0.9)",
              fontFamily: FONT_SANS,
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 18px",
              textTransform: "none",
              "&:hover": { background: "rgba(220,80,80,0.25)" },
              "&.Mui-disabled": { opacity: 0.5 },
            }}
          >
            {deleting ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : "Archive room"}
          </Button>
        </DialogActions>
      </Dialog>

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

// ─── Server-side props ────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.params as { code: string };
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) return { redirect: { destination: "/login", permanent: false } };

  const userId = Number((session.user as any).id);
  const username = (session.user as any).username ?? "";

  const room = await prisma.rooms.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      type: true,
      visibility: true,
      playerCount: true,
      timeBudget: true,
      hostId: true,
      isActive: true,
    },
  });

  if (!room || !room.isActive) return { notFound: true };

  // Only the host can access settings
  if (room.hostId !== userId) {
    return { redirect: { destination: `/rooms/${code}`, permanent: false } };
  }

  return {
    props: {
      username,
      room: {
        id: room.id,
        name: room.name,
        description: room.description ?? "",
        code: room.code,
        type: room.type,
        visibility: room.visibility,
        playerCount: room.playerCount ?? 4,
        timeBudget: room.timeBudget ?? 120,
      },
    },
  };
};
