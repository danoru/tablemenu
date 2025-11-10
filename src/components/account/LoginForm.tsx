import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React from "react";
import * as Yup from "yup";

function LoginForm() {
  const router = useRouter();
  const initialValues = { username: "", password: "", rememberMe: false };
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required."),
    password: Yup.string().required("Password is required."),
  });
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error">("success");

  async function handleSubmit(
    values: { username: string; password: string; rememberMe: Boolean },
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
      setSnackbarMessage("Login successful. You are being redirected.");
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      router.push("/");
      router.refresh();
    }

    setSubmitting(false);
  }

  return (
    <Grid container justifyContent="center" sx={{ margin: "auto", p: 4 }}>
      <Grid size={{ xs: 3, sm: 8, md: 5 }}>
        {/* <Stack direction="column">
          <Avatar>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
        </Stack> */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
            <Form>
              <TextField
                autoFocus
                fullWidth
                required
                error={touched.username && !!errors.username}
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
                required
                autoComplete="current-password"
                error={touched.password && !!errors.password}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.rememberMe}
                    color="primary"
                    name="rememberMe"
                    onChange={handleChange}
                  />
                }
                label="Remember Me"
              />
              <Button
                fullWidth
                color="primary"
                disabled={isSubmitting}
                type="submit"
                variant="contained"
              >
                Login
              </Button>
              <Grid container>
                <Grid>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Register"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Grid>
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default LoginForm;
