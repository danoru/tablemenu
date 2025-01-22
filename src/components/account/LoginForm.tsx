import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function LoginForm() {
  const router = useRouter();
  const initialValues = { username: "", password: "", rememberMe: false };
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required."),
    password: Yup.string().required("Password is required."),
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

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
      <Grid item xs={3} sm={8} md={5}>
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
          {({
            isSubmitting,
            errors,
            touched,
            handleChange,
            handleBlur,
            values,
          }) => (
            <Form>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoFocus
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                error={touched.username && !!errors.username}
                helperText={touched.username && errors.username}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.rememberMe}
                    onChange={handleChange}
                    name="rememberMe"
                    color="primary"
                  />
                }
                label="Remember Me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                Login
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Register"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default LoginForm;
