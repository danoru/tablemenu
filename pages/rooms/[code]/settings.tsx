import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_OLIVE,
} from "@/styles/theme";
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

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";

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

const TIME_MARKS = [
  { value: 60, label: "1hr" },
  { value: 120, label: "2hr" },
  { value: 180, label: "3hr" },
  { value: 240, label: "4hr+" },
];

function ToggleOption({
  label,
  sublabel,
  active,
  onClick,
  accent = "primary.main",
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
          ? accent === "secondary.light"
            ? TINT_OLIVE
            : TINT_BRICK
          : "transparent",
        border: active ? BORDER_INK : "2px solid rgba(51,39,26,0.15)",
        transition: "all 0.15s",
        "&:hover": { borderColor: INK },
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "14px",
          fontWeight: 500,
          color: active ? "text.primary" : TEXT_DIM,
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

interface RoomSettingsData {
  id: number;
  name: string;
  description: string;
  code: string;
  type: "CASUAL" | "RECURRING";
  visibility: "PUBLIC" | "INVITE_ONLY";
  playerCount: number;
  timeBudget: number;
  isCompetitive: boolean;
}

interface Props {
  room: RoomSettingsData;
  username: string;
}

const validationSchema = Yup.object({
  name: Yup.string().max(60, "Max 60 characters").required("Room name is required"),
  description: Yup.string().max(200, "Max 200 characters"),
});

export default function RoomSettingsPage({ room, username }: Props) {
  const router = useRouter();
  const { code } = router.query as { code: string };

  const [roomType, setRoomType] = React.useState<"CASUAL" | "RECURRING">(room.type);
  const [visibility, setVisibility] = React.useState<"PUBLIC" | "INVITE_ONLY">(room.visibility);
  const [playerCount, setPlayerCount] = React.useState(room.playerCount || 4);
  const [timeBudget, setTimeBudget] = React.useState(room.timeBudget || 120);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [isCompetitive, setIsCompetitive] = React.useState(room.isCompetitive);

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
          isCompetitive,
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

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Typography
            onClick={() => router.push(`/rooms/${code}`)}
            sx={{
              ...sectionLabel,
              mb: "12px",
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
            }}
          >
            ← Back to room
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "28px", md: "36px" },
              fontWeight: 900,
              color: "text.primary",
              letterSpacing: "-0.5px",
              lineHeight: 1.05,
              mb: "6px",
            }}
          >
            Room Settings
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
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "13px",
                    boxShadow: SHADOW_HARD,
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Room Details</Typography>

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

                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "13px",
                    boxShadow: SHADOW_HARD,
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Room Type</Typography>
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
                      accent={"secondary.light"}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "13px",
                    boxShadow: SHADOW_HARD,
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
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "13px",
                    boxShadow: SHADOW_HARD,
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Play Style</Typography>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <ToggleOption
                      label="Competitive"
                      sublabel="Track winners when logging games"
                      active={isCompetitive}
                      onClick={() => setIsCompetitive(true)}
                    />
                    <ToggleOption
                      label="Casual"
                      sublabel="Just log who played, no scores"
                      active={!isCompetitive}
                      onClick={() => setIsCompetitive(false)}
                      accent="secondary.light"
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "13px",
                    boxShadow: SHADOW_HARD,
                    padding: { xs: "24px", md: "28px 32px" },
                    mb: "16px",
                  }}
                >
                  <Typography sx={sectionLabel}>Default settings</Typography>

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
                          "&:hover": { boxShadow: "0 0 0 8px rgba(192,69,44,0.15)" },
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
                          color: "text.primary",
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
                        color: "primary.main",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "primary.main",
                          "&:hover": { boxShadow: "0 0 0 8px rgba(192,69,44,0.15)" },
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
                </Box>

                <Box sx={{ display: "flex", gap: "10px", mb: "40px" }}>
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
                      "Save changes"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push(`/rooms/${code}`)}
                    sx={{ fontSize: "15px", padding: "13px 20px" }}
                  >
                    Cancel
                  </Button>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: `2px solid ${BRICK}`,
                    borderRadius: "13px",
                    padding: { xs: "24px", md: "28px 32px" },
                  }}
                >
                  <Typography sx={{ ...sectionLabel, color: BRICK }}>Danger Zone</Typography>
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
                          color: "text.primary",
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
                        border: `2px solid ${BRICK}`,
                        borderRadius: "999px",
                        color: BRICK,
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        fontWeight: 700,
                        padding: "8px 18px",
                        textTransform: "none",
                        flexShrink: 0,
                        "&:hover": {
                          background: TINT_BRICK,
                          borderColor: BRICK,
                          color: BRICK,
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

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle
          sx={{ fontFamily: FONT_SERIF, fontSize: "20px", fontWeight: 700, color: "text.primary" }}
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
              color: TEXT_DIM,
              fontSize: "13px",
              padding: "8px 18px",
              "&:hover": { color: "text.primary" },
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            disabled={deleting}
            variant="contained"
            onClick={handleDelete}
            sx={{
              fontSize: "13px",
              padding: "8px 18px",
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
      isCompetitive: true,
    },
  });

  if (!room || !room.isActive) return { notFound: true };

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
        isCompetitive: room.isCompetitive,
      },
    },
  };
};
