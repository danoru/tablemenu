import {
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD,
  GOLD_FADED,
  TEXT_DIM,
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
    background: "rgba(255,255,255,0.03)",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_AMBER },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
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
      router.replace("/dashboard");
    }

    setSubmitting(false);
  }

  return (
    <Box
      sx={{
        background: "background.default",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
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
          height: "50%",
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(34,85,48,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
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
                color: GOLD,
                letterSpacing: "-0.3px",
                lineHeight: 1,
              }}
            >
              Table
              <Box component="span" sx={{ color: GOLD_FADED, fontWeight: 700 }}>
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
            background: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "14px",
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
                        color: BORDER_AMBER,
                        "&.Mui-checked": { color: "primary.main" },
                        padding: "6px 8px",
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                      Remember me
                    </Typography>
                  }
                  sx={{ mb: "20px", ml: "-6px" }}
                />

                <Button
                  fullWidth
                  disabled={isSubmitting}
                  type="submit"
                  sx={{
                    background: "primary.main",
                    borderRadius: "8px",
                    color: "background.default",
                    fontFamily: FONT_SANS,
                    fontSize: "15px",
                    fontWeight: 500,
                    padding: "12px",
                    textTransform: "none",
                    mb: "20px",
                    "&:hover": { background: "primary.light" },
                    "&.Mui-disabled": {
                      background: "rgba(200,150,42,0.35)",
                      color: "rgba(15,12,8,0.5)",
                    },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} sx={{ color: "rgba(15,12,8,0.5)" }} />
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
                        color: GOLD,
                        textDecoration: "none",
                        fontWeight: 500,
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
