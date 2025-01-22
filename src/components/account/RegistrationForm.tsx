import React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import * as yup from "yup";
import { Formik, Form } from "formik";

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
      <Grid item xs={12} sm={8} md={5}>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }) => (
            <Form>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
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
