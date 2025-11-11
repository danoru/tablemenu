import { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { Grid, TextField, Button, Snackbar, Alert } from "@mui/material";

const validationSchema = yup.object({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long.")
    .required("Username is required."),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters long.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password."),
});

export default function RegistrationForm() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  async function handleSubmit(
    values: { username: string; password: string; confirmPassword: string },
    { setSubmitting, setFieldError, resetForm }: any
  ) {
    try {
      const { username, password } = values; // Only send these
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Registration successful!",
          severity: "success",
        });
        resetForm();
        setTimeout(() => router.push("/"), 1500);
      } else {
        if (data.error === "Username already exists.") setFieldError("username", data.error);
        setSnackbar({
          open: true,
          message: data.error || "Registration failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSnackbar({ open: true, message: "An unexpected error occurred", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Grid container justifyContent="center">
        <Grid>
          <Formik
            initialValues={{ username: "", password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, handleChange, handleBlur, values, touched, errors }) => (
              <Form>
                <TextField
                  fullWidth
                  autoFocus
                  autoComplete="username"
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  id="username"
                  label="Username"
                  margin="normal"
                  name="username"
                  value={values.username}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  autoComplete="new-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  id="password"
                  label="Password"
                  margin="normal"
                  name="password"
                  type="password"
                  value={values.password}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  autoComplete="new-password"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  id="confirmPassword"
                  label="Confirm Password"
                  margin="normal"
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <Button
                  fullWidth
                  color="primary"
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
