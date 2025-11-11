import { Button, Grid, TextField } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long.")
    .required("Username is required."),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters long.")
    .required("Password is required."),
});

function RegistrationForm() {
  async function handleSubmit(
    values: { username: string; password: string },
    { setSubmitting, setFieldError, resetForm }: any
  ) {
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        console.log("Registration successful");
        resetForm();
      } else {
        const data = await res.json();
        if (data.error === "Username already exists.") {
          setFieldError("username", "Username already exists.");
        } else {
          console.error("Registration failed:", data.error);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 8, md: 5 }}>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleChange, handleBlur, values, touched, errors }) => (
            <Form>
              <TextField
                autoFocus
                fullWidth
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
                autoComplete="current-password"
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
  );
}

export default RegistrationForm;
