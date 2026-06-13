import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import * as Yup from "yup";

import { safeNextPath } from "@/lib/redirect";

const inputSx = {
  mb: "16px",
  "& .MuiInputLabel-root": {
    fontFamily: FONT_SANS,
    fontSize: "14px",
    color: "text.secondary",
    "&.Mui-focused": { color: "text.primary" },
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
  username: Yup.string()
    .min(5, "Username must be at least 5 characters.")
    .required("Username is required."),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match.")
    .required("Please confirm your password."),
});

export default function RegistrationForm() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  function handleClose() {
    setSnackbar((s) => ({ ...s, open: false }));
  }

  async function handleSubmit(
    values: { username: string; password: string; confirmPassword: string },
    { setSubmitting, setFieldError, resetForm }: any
  ) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: "Account created! Redirecting…", severity: "success" });
        resetForm();
        const next = safeNextPath(router.query);
        const loginUrl = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
        setTimeout(() => router.push(loginUrl), 1500);
      } else {
        if (data.error === "Username already exists.") {
          setFieldError("username", data.error);
        }
        setSnackbar({
          open: true,
          message: data.error || "Registration failed.",
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
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "420px" }}>
        <Box sx={{ textAlign: "center", mb: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "28px",
                fontWeight: 900,
                fontStyle: "italic",
                color: INK,
                letterSpacing: "-0.3px",
                lineHeight: 1,
              }}
            >
              Table
              <Box component="span" sx={{ color: BRICK }}>
                keeper
              </Box>
            </Typography>
          </Link>
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "8px" }}
          >
            Create your account
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: "background.paper",
            border: BORDER_INK,
            borderRadius: "13px",
            boxShadow: SHADOW_HARD,
            padding: { xs: "28px 24px", sm: "36px 40px" },
          }}
        >
          <Formik
            initialValues={{ username: "", password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
              <Form noValidate>
                <TextField
                  autoFocus
                  fullWidth
                  required
                  autoComplete="username"
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                  id="username"
                  label="Username"
                  name="username"
                  value={values.username}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  required
                  autoComplete="new-password"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  value={values.password}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  required
                  autoComplete="new-password"
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  id="confirmPassword"
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  sx={inputSx}
                />

                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    color: TEXT_FAINT,
                    mb: "20px",
                    mt: "-8px",
                  }}
                >
                  At least 5 characters
                </Typography>

                <Button
                  fullWidth
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  sx={{
                    fontSize: "15px",
                    padding: "12px",
                    mb: "20px",
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} sx={{ color: "inherit" }} />
                  ) : (
                    "Create account"
                  )}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      style={{ color: BRICK, textDecoration: "none", fontWeight: 700 }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>

        <Box sx={{ textAlign: "center", mt: "24px" }}>
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
            Game data powered by{" "}
            <Link
              href="https://boardgamegeek.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: TEXT_DIM, textDecoration: "none" }}
            >
              BoardGameGeek
            </Link>
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleClose}
          sx={{ fontFamily: FONT_SANS, fontSize: "14px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
