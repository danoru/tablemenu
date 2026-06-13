import { authOptions } from "@/lib/authOptions";
import { avatarColor } from "@/lib/helpers";
import {
  BORDER_INK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  SURFACE,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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

const validationSchema = Yup.object({
  firstName: Yup.string().max(50, "Max 50 characters."),
  lastName: Yup.string().max(50, "Max 50 characters."),
  bio: Yup.string().max(280, "Bio must be 280 characters or fewer."),
  location: Yup.string().max(100, "Max 100 characters."),
  website: Yup.string().url("Must be a valid URL (include https://).").nullable(),
});

interface ProfileValues {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
}

interface Props {
  username: string;
  initial: ProfileValues;
}

export default function EditProfilePage({ username, initial }: Props) {
  const router = useRouter();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  async function handleSubmit(values: ProfileValues, { setSubmitting }: any) {
    try {
      const res = await fetch(`/api/user/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Profile updated!", severity: "success" });
        setTimeout(() => router.push(`/users/${username}`), 1200);
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.message || "Failed to update profile.",
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
        <title>Edit Profile — Tablekeeper</title>
      </Head>

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Box sx={{ mb: "32px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "12px",
                fontWeight: 500,
                color: TEXT_FAINT,
                letterSpacing: "1px",
                textTransform: "uppercase",
                mb: "6px",
                cursor: "pointer",
                "&:hover": { color: TEXT_DIM },
              }}
              onClick={() => router.push(`/users/${username}`)}
            >
              ← Back to profile
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: { xs: "30px", md: "38px" },
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: "-0.5px",
                lineHeight: 1.05,
              }}
            >
              Edit profile
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              mb: "28px",
            }}
          >
            <Box
              sx={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: avatarColor(username),
                border: `2px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "rgba(255,251,240,0.9)",
                  userSelect: "none",
                }}
              >
                {username.slice(0, 1).toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {username}
              </Typography>
            </Box>
          </Box>

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
              initialValues={initial}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
                <Form noValidate>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: TEXT_FAINT,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      mb: "12px",
                    }}
                  >
                    Name
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      label="First name"
                      name="firstName"
                      value={values.firstName}
                      error={touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      sx={inputSx}
                    />
                    <TextField
                      fullWidth
                      id="lastName"
                      label="Last name"
                      name="lastName"
                      value={values.lastName}
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      sx={inputSx}
                    />
                  </Box>

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: TEXT_FAINT,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      mb: "12px",
                    }}
                  >
                    About
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="bio"
                    label="Bio"
                    name="bio"
                    value={values.bio}
                    error={touched.bio && !!errors.bio}
                    helperText={(touched.bio && errors.bio) || `${values.bio.length}/280`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{
                      ...inputSx,
                      "& .MuiFormHelperText-root": {
                        fontFamily: FONT_SANS,
                        fontSize: "12px",
                        color: values.bio.length > 260 ? "error.main" : TEXT_FAINT,
                        ml: 0,
                        textAlign: "right",
                      },
                    }}
                  />

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: TEXT_FAINT,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      mb: "12px",
                    }}
                  >
                    Links
                  </Typography>
                  <TextField
                    fullWidth
                    id="location"
                    label="Location"
                    name="location"
                    placeholder="e.g. Austin, TX"
                    value={values.location}
                    error={touched.location && !!errors.location}
                    helperText={touched.location && errors.location}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    id="website"
                    label="Website"
                    name="website"
                    placeholder="https://yoursite.com"
                    value={values.website}
                    error={touched.website && !!errors.website}
                    helperText={touched.website && errors.website}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={inputSx}
                  />

                  <Divider sx={{ borderColor: "divider", mb: "24px" }} />

                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Button
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: "primary.main",
                        border: BORDER_INK,
                        borderRadius: "999px",
                        boxShadow: SHADOW_HARD,
                        color: SURFACE,
                        fontFamily: FONT_SANS,
                        fontSize: "15px",
                        fontWeight: 700,
                        padding: "12px",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "primary.light" },
                        "&.Mui-disabled": {
                          background: "rgba(51,39,26,0.15)",
                          border: "2px solid rgba(51,39,26,0.38)",
                          boxShadow: "none",
                          color: "rgba(51,39,26,0.5)",
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: "rgba(51,39,26,0.5)" }} />
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push(`/users/${username}`)}
                      sx={{
                        backgroundColor: "background.paper",
                        border: BORDER_INK,
                        borderRadius: "999px",
                        boxShadow: SHADOW_HARD,
                        color: "text.primary",
                        fontFamily: FONT_SANS,
                        fontSize: "15px",
                        fontWeight: 700,
                        padding: "12px 20px",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "background.paper",
                          boxShadow: `4px 4px 0 ${INK}`,
                          transform: "translate(-1px, -1px)",
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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: FONT_SANS }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params as { username: string };
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user || (session.user as any).username !== username) {
    return { redirect: { destination: `/users/${username}`, permanent: false } };
  }

  const { default: prisma } = await import("@data/db");
  const user = await prisma.users.findUnique({
    where: { username },
    select: {
      firstName: true,
      lastName: true,
      bio: true,
      location: true,
      website: true,
    },
  });

  if (!user) return { notFound: true };

  return {
    props: {
      username,
      initial: {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
      },
    },
  };
};
