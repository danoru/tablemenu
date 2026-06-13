import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  TEXT_FAINT,
} from "@/styles/theme";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
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
  username: Yup.string().required("Username is required."),
  password: Yup.string().required("Password is required."),
});

export default function LoginForm() {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error">("success");

  async function handleSubmit(
    values: { username: string; password: string; rememberMe: boolean },
    { setSubmitting, setErrors }: any
  ) {
    const response = await signIn("credentials", {
      username: values.username,
      password: values.password,
      remember: values.rememberMe,
      redirect: false,
    });

    if (response?.error) {
      setErrors({ submit: response.error });
      setSnackbarMessage("Login failed. Your credentials do not match.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Welcome back! Redirecting…");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      router.replace(safeNextPath(router.query) ?? "/dashboard");
    }

    setSubmitting(false);
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
      <Box
        sx={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
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
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "14px",
              color: TEXT_FAINT,
              mt: "8px",
            }}
          >
            Sign in to your account
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
            initialValues={{ username: "", password: "", rememberMe: false }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
              <Form noValidate>
                <TextField
                  autoFocus
                  fullWidth
                  required
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
                  autoComplete="current-password"
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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.rememberMe}
                      name="rememberMe"
                      onChange={handleChange}
                      sx={{
                        color: "rgba(51,39,26,0.4)",
                        "&.Mui-checked": { color: "primary.main" },
                        padding: "6px 8px",
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: "text.secondary" }}
                    >
                      Remember me
                    </Typography>
                  }
                  sx={{ mb: "20px", ml: "-6px" }}
                />

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
                    "Sign in"
                  )}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      style={{
                        color: BRICK,
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Create one
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>

      <Snackbar autoHideDuration={5000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ fontFamily: FONT_SANS, fontSize: "14px" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
